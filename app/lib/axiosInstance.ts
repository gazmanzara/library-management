import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://library-management-api-production-a5d2.up.railway.app/api",
});

export default axiosInstance;
