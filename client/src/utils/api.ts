import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
import api from "./axios";
import { useQuery, useMutation } from "@tanstack/react-query";

export interface formData {
	username: string;
	password?: string;
	id?: string;
	_id?: string;
	email: string;
	image?: File | null;
}

// Login API call
interface LoginResponse {
	user: {
		id: string;
		username: string;
		email: string;
		image?: string | null;
	};
	token: string;
}

const login = async (credentials: formData): Promise<LoginResponse> => {
	const req = await api.post<LoginResponse>("user/login", credentials);
	return req.data;
};

// Register API call
interface RegisterResponse {
	user: {
		id: string;
		username: string;
		email: string;
		image?: File | null;
	};
}

const register = async (credentials: formData): Promise<RegisterResponse> => {
	const req = await api.post("user/", credentials, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return req.data;
};

const logOutFN = async () => {
	await api.post("user/logout", null, {
		withCredentials: true,
	});
};

// Get data API call
interface DataResponse {
	[key: string]: string | number | boolean | null | undefined;
}

const getData = async (url: string, token?: string): Promise<DataResponse> => {
	const headers = token
		? {
				headers: {
					Authorization: `Bearer ${token}`,
				},
		  }
		: {};

	const req = await api.get<DataResponse>(url, headers);

	return req.data;
};

// LoginUser hook
export const LoginUser = () => {
	const logIn = useAuthStore((state) => state.login);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			function normalizeUser(user: LoginResponse["user"]) {
				if (!user) return user;
				return {
					...user,
					_id: user._id || user.id,
					id: user._id || user.id,
				};
			}

			logIn(data.token, normalizeUser(data.user));
			navigate("/");
		},
		onError: (error) => {
			console.error("Login failed:", error);
		},
	});
};

export const LogoutUser = () => {
	const logout = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logOutFN,
		onSuccess: () => {
			logout(); // Clear user data from the store
			navigate("/gallery"); // Redirect to the gallery page
		},
		onError: (error) => {
			console.error("Logout failed:", error);
		},
	});
};

// RegisterUser hook
export const RegisterUser = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: register,
		onSuccess: () => {
			navigate("/login");
		},
		onError: (error) => {
			console.error("Registration failed:", error);
		},
	});
};

// GetData hook
export const GetData = (url: string) => {
	const token = useAuthStore((state) => state.accessToken);

	return useQuery({
		queryKey: ["data", url],
		queryFn: async () => {
			const data = await getData(url, token ?? undefined);
			return data;
		},
	});
};
