import axios from "axios";

let getAuthToken = null;

export const setAxiosAuthTokenGetter = (tokenGetter) => {
  getAuthToken = tokenGetter;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (getAuthToken) {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default axiosInstance;
