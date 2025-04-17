import React, { useEffect, useState } from "react";
import { LoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
import { Mail, Lock } from "lucide-react";
import { LogoutUser } from "../utils/api";


const Login: React.FC = () => {
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const { mutate, isPending, isError, error } = LoginUser();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <fieldset className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <legend className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-4">
          Login
        </legend>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail size={20} />
              Username
            </label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail size={20} />
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Lock size={20} />
              Password
            </label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
          {isError && (
            <p className="text-red-500 mt-2">
              Error: {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
        </form>
      </fieldset>
    </div>
  );
};

export default Login;


export const Logout: React.FC = () => {
  const { mutate: logout, isPending } = LogoutUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <fieldset className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <legend className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">
          Log Out
        </legend>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white rounded-md p-2 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500 transition-colors"
          disabled={isPending}
        >
          {isPending ? "Logging out..." : "Yes, I want to log out"}
        </button>
      </fieldset>
    </div>
  );
};
