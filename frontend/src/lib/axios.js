import axios from "axios";

let getAuthToken = null;

export const setAxiosAuthTokenGetter = (tokenGetter) => {
    getAuthToken = tokenGetter;
};

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Set the base URL for your API
    withCredentials: true, //browser will send cookies with every request automatically
})

axiosInstance.interceptors.request.use(async (config) => {
    if (getAuthToken) {
        const token = await getAuthToken();

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export default axiosInstance;