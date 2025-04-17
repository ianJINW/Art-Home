import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
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

    try {
      await api.post("user/logout", { withCredentials: true }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }

  }
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
			logIn(data.token, {
				...data.user,
				image: null,
			});
			navigate("/");
			console.log(data.user);
			console.log(`Logged in successfully`, data.user, data);
		},
		onError: (error) => {
			console.error(`Error logging in`, error.message);
		},
	});
};

export const LogoutUser = ()=>{
	const logout = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	return useMutation({
		mutationFn: logoutFn,
		onSuccess: {
			logout()
			navigate('/gallery')
			console.log('Logged out successFully')
		},onError: (error)=> {
			console.log('This is stupid')
		}
	})
}
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
export const GetData = (url: string) => {
	const token = useAuthStore((state) => state.accessToken);

	return useQuery({
		queryKey: ["data", url],
		queryFn: async () => {
			const data = await getData(url, token ?? undefined);
			console.log(`Data fetched successfully`, data);
			return data;
		},
	});
};
