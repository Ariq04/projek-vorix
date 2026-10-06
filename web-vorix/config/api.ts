const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const isLocal = 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1" || 
      window.location.hostname.startsWith("192.168.");
    if (isLocal) {
      return "http://localhost:8000";
    }
  }
  return "https://projek-vorix-production.up.railway.app";
};

export const BACKEND_URL = getBackendUrl();
