import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formData } from "../utils/api";

interface AuthState {
	user: formData | null;
	isLoading: boolean;
	isAuth: boolean;
	accessToken: string | null;
	setAuthToken: (token: string) => void;
	setUser: (user: formData) => void;
}

const AuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuth: false,
			isLoading: false,
			accessToken: null,
			setAuthToken: (token: string) => set({ accessToken: token }),
			setUser: (user: formData) => set({ user }),
		}),
		{
			name: "auth-store",
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
			}),
		}
	)
);

export default AuthStore;
