import os
import time
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from web3 import Web3
from eth_account import Account

# Enable mnemonic (HD Wallet) support in eth_account
Account.enable_unaudited_hdwallet_features()

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VORIX-Executor")

# RPC Nodes for BSC Testnet (Chain ID: 97)
BSC_TESTNET_RPCS = [
    "https://data-seed-prebsc-1-s1.bnbchain.org:8545/",
    "https://data-seed-prebsc-2-s1.bnbchain.org:8545/",
    "https://bsc-testnet.blockpi.network/v1/rpc/public",
    "https://bsc-testnet.publicnode.com",
    "https://rpc.ankr.com/bsc_testnet_chapel"
]

# PancakeSwap V2 Router & WBNB Addresses on BSC Testnet
PANCAKESWAP_ROUTER_V2_TESTNET = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
WBNB_TESTNET = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
DEFAULT_TARGET_TOKEN = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684" # Test USDT

# ABIs
ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactETHForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForETH",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": False,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "remaining", "type": "uint256"}],
        "type": "function"
    }
]

def get_web3_instance() -> Web3:
    """
    Connect to BSC Testnet RPC with automatic failover.
    """
    for rpc in BSC_TESTNET_RPCS:
        try:
            w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={'timeout': 8}))
            if w3.is_connected():
                logger.info(f"Connected to BSC Testnet RPC: {rpc}")
                return w3
        except Exception as e:
            logger.warning(f"Failed to connect to RPC {rpc}: {e}")
            continue
            
    raise RuntimeError("Unable to connect to any BSC Testnet RPC node.")

def derive_account_from_secret(secret_str: str):
    """
    Supports both 64-char Hex Private Key and 12/24 word Mnemonic Seed Phrase.
    """
    secret_clean = secret_str.strip()
    words = secret_clean.split()
    
    if len(words) in [12, 15, 18, 21, 24]:
        return Account.from_mnemonic(secret_clean)
    else:
        if not secret_clean.startswith("0x") and len(secret_clean) == 64:
            secret_clean = "0x" + secret_clean
        return Account.from_key(secret_clean)

def execute_buy_action(
    decision: str,
    target_token_address: str = DEFAULT_TARGET_TOKEN,
    amount_in_bnb: float = 0.001
) -> Dict[str, Any]:
    """
    Executes autonomous buy swap on PancakeSwap Testnet if AI decision is 'STRONG_BUY'.
    """
    normalized_decision = str(decision).upper().strip()
    
    if normalized_decision != "STRONG_BUY":
        logger.info(f"Buy execution skipped. Decision is '{normalized_decision}'.")
        return {
            "status": "skipped",
            "reason": f"Decision '{normalized_decision}' does not meet STRONG_BUY criteria.",
            "action": "BUY",
            "tx_hash": None,
            "explorer_link": None
        }

    secret_key = os.getenv("VORIX_PRIVATE_KEY")
    if not secret_key or secret_key in ["your_bsc_testnet_private_key_here", ""]:
        return {
            "status": "failed",
            "reason": "VORIX_PRIVATE_KEY is not configured in .env file.",
            "action": "BUY",
            "tx_hash": None,
            "explorer_link": None
        }

    try:
        w3 = get_web3_instance()
        account = derive_account_from_secret(secret_key)
        wallet_address = account.address
        private_key = account.key.hex()
        
        balance_wei = w3.eth.get_balance(wallet_address)
        balance_bnb = float(w3.from_wei(balance_wei, 'ether'))
        
        # Reserve gas fee buffer (0.001 tBNB for gas)
        gas_buffer_bnb = 0.001
        usable_bnb = max(0.0, balance_bnb - gas_buffer_bnb)
        
        # Smart Dynamic Position Sizing: 10% to 15% of available free balance per trade!
        dynamic_10pct = round(usable_bnb * 0.10, 4)
        
        if balance_bnb < (amount_in_bnb + gas_buffer_bnb):
            if usable_bnb >= 0.001:
                # Automatically adapt to 10% of available balance (min 0.001 tBNB)
                amount_in_bnb = max(0.001, dynamic_10pct)
                value_in_wei = w3.to_wei(amount_in_bnb, 'ether')
                logger.info(f"Dynamic Position Sizing Active: Adjusted buy amount to {amount_in_bnb} tBNB (10% of {balance_bnb:.5f} tBNB balance).")
            else:
                return {
                    "status": "failed",
                    "reason": f"Insufficient wallet balance ({balance_bnb:.5f} tBNB). Minimum required balance for trade + gas is 0.002 tBNB.",
                    "action": "BUY",
                    "tx_hash": None,
                    "explorer_link": None
                }
        else:
            value_in_wei = w3.to_wei(amount_in_bnb, 'ether')

        router_address = w3.to_checksum_address(PANCAKESWAP_ROUTER_V2_TESTNET)
        target_token = w3.to_checksum_address(target_token_address)
        wbnb_token = w3.to_checksum_address(WBNB_TESTNET)
        
        router_contract = w3.eth.contract(address=router_address, abi=ROUTER_ABI)
        path = [wbnb_token, target_token]
        deadline = int(time.time()) + 600
        
        nonce = w3.eth.get_transaction_count(wallet_address, 'pending')
        gas_price = w3.eth.gas_price

        raw_tx = router_contract.functions.swapExactETHForTokens(
            0,
            path,
            wallet_address,
            deadline
        ).build_transaction({
            'from': wallet_address,
            'value': value_in_wei,
            'gas': 250000,
            'gasPrice': gas_price,
            'nonce': nonce,
            'chainId': 97
        })
        
        signed_tx = w3.eth.account.sign_transaction(raw_tx, private_key=private_key)
        raw_bytes = getattr(signed_tx, 'raw_transaction', getattr(signed_tx, 'rawTransaction', None))
        
        tx_hash_bytes = w3.eth.send_raw_transaction(raw_bytes)
        tx_hash_str = w3.to_hex(tx_hash_bytes)
        explorer_url = f"https://testnet.bscscan.com/tx/{tx_hash_str}"
        
        logger.info(f"BUY transaction sent! TxHash: {tx_hash_str}")
        
        return {
            "status": "success",
            "action": "BUY",
            "reason": "Autonomous BUY swap successfully broadcast to BSC Testnet.",
            "tx_hash": tx_hash_str,
            "explorer_link": explorer_url,
            "wallet_used": wallet_address,
            "amount_bnb": amount_in_bnb
        }

    except Exception as e:
        logger.error(f"Buy execution failed: {e}")
        return {
            "status": "failed",
            "action": "BUY",
            "reason": f"Blockchain transaction error: {str(e)}",
            "tx_hash": None,
            "explorer_link": None
        }

def execute_sell_action(
    decision: str = "STRONG_SELL",
    target_token_address: str = DEFAULT_TARGET_TOKEN,
    amount_token_pct: float = 1.0 # 1.0 = 100% of token balance
) -> Dict[str, Any]:
    """
    Executes autonomous sell swap (Tokens -> BNB) on PancakeSwap Testnet.
    Allows taking profit or closing positions automatically when AI signals 'STRONG_SELL' or 'AVOID'.
    """
    secret_key = os.getenv("VORIX_PRIVATE_KEY")
    if not secret_key or secret_key in ["your_bsc_testnet_private_key_here", ""]:
        return {
            "status": "failed",
            "action": "SELL",
            "reason": "VORIX_PRIVATE_KEY is not configured in .env file.",
            "tx_hash": None,
            "explorer_link": None
        }

    try:
        w3 = get_web3_instance()
        account = derive_account_from_secret(secret_key)
        wallet_address = account.address
        private_key = account.key.hex()

        target_token = w3.to_checksum_address(target_token_address)
        router_address = w3.to_checksum_address(PANCAKESWAP_ROUTER_V2_TESTNET)
        wbnb_token = w3.to_checksum_address(WBNB_TESTNET)

        token_contract = w3.eth.contract(address=target_token, abi=ERC20_ABI)
        token_balance = token_contract.functions.balanceOf(wallet_address).call()

        if token_balance <= 0:
            logger.info(f"No token balance to sell for wallet {wallet_address}.")
            return {
                "status": "skipped",
                "action": "SELL",
                "reason": "Tidak ada saldo token untuk dijual di dompet.",
                "tx_hash": None,
                "explorer_link": None
            }

        sell_amount = int(token_balance * amount_token_pct)
        logger.info(f"Executing autonomous SELL for {sell_amount} token wei...")

        # 1. Check & Approve Unlimited Allowance for Router
        current_allowance = token_contract.functions.allowance(wallet_address, router_address).call()
        if current_allowance < sell_amount:
            logger.info("Approving PancakeSwap Router with unlimited allowance...")
            nonce = w3.eth.get_transaction_count(wallet_address, 'pending')
            max_uint256 = 2**256 - 1
            approve_tx = token_contract.functions.approve(router_address, max_uint256).build_transaction({
                'from': wallet_address,
                'gas': 100000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce,
                'chainId': 97
            })
            signed_approve = w3.eth.account.sign_transaction(approve_tx, private_key=private_key)
            raw_approve_bytes = getattr(signed_approve, 'raw_transaction', getattr(signed_approve, 'rawTransaction', None))
            app_tx_hash = w3.eth.send_raw_transaction(raw_approve_bytes)
            logger.info(f"Waiting for approve receipt: {w3.to_hex(app_tx_hash)}...")
            w3.eth.wait_for_transaction_receipt(app_tx_hash, timeout=30)
            logger.info("Approve transaction confirmed on BSC Testnet!")

        # 2. Build swapExactTokensForETH transaction
        router_contract = w3.eth.contract(address=router_address, abi=ROUTER_ABI)
        path = [target_token, wbnb_token]
        deadline = int(time.time()) + 600
        nonce = w3.eth.get_transaction_count(wallet_address, 'pending')

        sell_tx = router_contract.functions.swapExactTokensForETH(
            sell_amount,
            0, # amountOutMin
            path,
            wallet_address,
            deadline
        ).build_transaction({
            'from': wallet_address,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
            'chainId': 97
        })

        signed_sell = w3.eth.account.sign_transaction(sell_tx, private_key=private_key)
        raw_sell_bytes = getattr(signed_sell, 'raw_transaction', getattr(signed_sell, 'rawTransaction', None))
        
        tx_hash_bytes = w3.eth.send_raw_transaction(raw_sell_bytes)
        tx_hash_str = w3.to_hex(tx_hash_bytes)
        explorer_url = f"https://testnet.bscscan.com/tx/{tx_hash_str}"

        logger.info(f"SELL transaction successfully sent! TxHash: {tx_hash_str}")

        return {
            "status": "success",
            "action": "SELL",
            "reason": "Autonomous SELL / Take Profit swap successfully broadcast to BSC Testnet.",
            "tx_hash": tx_hash_str,
            "explorer_link": explorer_url,
            "wallet_used": wallet_address,
            "tokens_sold": sell_amount
        }

    except Exception as e:
        logger.error(f"Sell execution failed: {e}")
        return {
            "status": "failed",
            "action": "SELL",
            "reason": f"Blockchain sell transaction error: {str(e)}",
            "tx_hash": None,
            "explorer_link": None
        }

if __name__ == "__main__":
    import json
    print("Testing executor.py sell action...")
    res = execute_sell_action(decision="STRONG_SELL")
    print(json.dumps(res, indent=2))
