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

api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Call the refresh token endpoint
				const { data } = await axios.post(
					`${backend}/user/refresh`,
					{},
					{ withCredentials: true }
				);

				// Save the new access token
				localStorage.setItem("auth-store", data.accessToken);

				// Retry the original request with the new access token
				originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				console.error("Refresh token failed:", refreshError);
				localStorage.removeItem("auth-store");
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

export default api;
