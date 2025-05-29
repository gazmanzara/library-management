import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://library-management-api-3cjq.onrender.com/api",
});

export default axiosInstance;
