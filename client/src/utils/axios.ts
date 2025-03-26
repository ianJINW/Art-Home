import axios from "axios";
import { apiUrl } from "./url";
const backend = import.meta.env.VITE_API_BACKEND_URL as string;

const api = axios.create({
	baseURL: apiUrl(backend, ""),
	withCredentials: true,
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth-store");

		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default api;
