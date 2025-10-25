import axios from "axios";

/**
 * Axios instance configured for API communication
 * Pre-configured with base URL from environment variables and JSON content type
 * 
 * @constant {AxiosInstance} api - Axios instance for all HTTP requests
 */
const api = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
