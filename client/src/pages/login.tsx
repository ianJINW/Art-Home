import React, { useEffect, useState } from "react";
import { LoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
import { Mail, Lock } from "lucide-react";
import api from "@/utils/axios";

const Login: React.FC = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const { mutate, isPending, isError, error } = LoginUser();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      console.log("Hello");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      username: data.email,
      email: data.email,
      password: data.password,
    };

    mutate(formData, {
      onSuccess: (data) => {
        console.log("User data:", data.user);
      },
    });
  };

  return (
    <div>
      <fieldset className="border-dotted border-4 border-blue-500 rounded-xl">
        <legend>
          <h1>Login</h1>
        </legend>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col m-1 p-1 text-black radius-100 border-gray-600"
        >
          <label className="flex items-center gap-2">
            <Mail size={20} />
            Email
          </label>
          <input
            type="email"
            className="border border-gray-400 rounded-md p-2 mt-1"
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label className="flex items-center gap-2 mt-4">
            <Lock size={20} />
            Password
          </label>
          <input
            type="password"
            className="border border-gray-400 rounded-md p-2 mt-1"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button
            className="cursor-pointer bg-blue-500 text-white rounded-md p-2 mt-4 hover:bg-blue-600"
            type="submit"
          >
            {isPending ? `Logging in ...` : "Login"}
          </button>
          {isError && (
            <p className="text-red-500 mt-2">
              Error: {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          )}
        </form>
      </fieldset>
    </div>
  );
};

const Logout: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate()

  const logOutFN = async () => {
    try {
      await api.post("user/logout", { withCredentials: true }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }

  }
  return (
    <fieldset>
      <legend>Log out</legend>
      <button onClick={() => navigate('/')}>Not really.</button>

      <button onClick={logOutFN}>Yes, I want to log out</button>
    </fieldset>

  )
}

export default Login;
export { Logout }