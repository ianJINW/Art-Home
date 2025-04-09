import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formData } from "../utils/api";

interface AuthState {
	user: formData | null;
	accessToken: string | null;
	login: (token: string, user: formData) => void;
	logout: () => void;
}

const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: get()?.user || null,
			accessToken: get()?.accessToken || null,
			login: (token, user) =>
				set({
					accessToken: token,
					user: user,
				}),
			logout: () =>
				set({
					user: null,
					accessToken: null,
				}),
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

export default useAuthStore;
