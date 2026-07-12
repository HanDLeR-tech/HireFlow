import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Set the base URL for your API
    withCredentials: true, //browser will send cookies with every request automatically
})

export default axiosInstance;