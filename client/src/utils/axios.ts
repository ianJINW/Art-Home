import axios from "axios";
import { apiUrl } from "./url";
const backend = import.meta.env.VITE_API_BACKEND_URL as string;

axios.defaults.withCredentials = true;
const api = axios.create({
	baseURL: apiUrl(backend, ""),
	withCredentials: true,
});

api.interceptors.request.use(
	(config) => {
		const store = localStorage.getItem("auth-store");
		let token = "";
		if (store) {
			try {
				const parsed = JSON.parse(store);
				token = parsed.state?.accessToken || parsed.accessToken || "";
			} catch {}
		}
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
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
