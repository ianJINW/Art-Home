import { useNavigate } from "react-router-dom";
import AuthStore from "../stores/auth.store";
import api from "./axios";
import { useQuery, useMutation } from "@tanstack/react-query";

export interface formData {
	username: string;
	password?: string;
	email: string;
	image?: File | null;
}

// Login API call
interface LoginResponse {
	user: {
		id: string;
		username: string;
		email: string;
		image?: File | null;
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

// Get data API call
interface DataResponse {
	[key: string]: string | number | boolean | null | undefined;
}

const getData = async (): Promise<DataResponse> => {
	const req = await api.get<DataResponse>("/data");
	return req.data;
};

// LoginUser hook
export const LoginUser = () => {
	const setAuthToken = AuthStore((state) => state.setAuthToken);
	const setUser = AuthStore((state) => state.setUser);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setUser({ ...data.user, password: undefined });
			setAuthToken(data.token);
			navigate("/");
			console.log(`Logged in successfully`, data);
		},
		onError: (error) => {
			console.error(`Error logging in`, error.message);
		},
	});
};

// RegisterUser hook
export const RegisterUser = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationFn: register,
		onSuccess: (data) => {
			console.log(`Registered successfully`, data);
			navigate("/login");
		},
		onError: (error) => {
			console.error(`Error registering`, error.message);
		},
	});
};

// GetData hook
export const GetData = () => {
	return useQuery({
		queryKey: ["data"],
		queryFn: async () => {
			const data = await getData();
			console.log(`Data fetched successfully`, data);
			return data;
		},
	});
};
