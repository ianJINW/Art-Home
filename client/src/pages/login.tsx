import React, { useEffect, useState } from "react";
import { LoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";

const Login: React.FC = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const { mutate, isPending, isError, error } = LoginUser();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
      console.log('Hello')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      username: data.email,
      email: data.email,
      password: data.password,
    };

    mutate(formData);
  };

  return (
    <div>
      <fieldset className="border-dotted border-4 border-blue-500 rounded-xl">
        <legend>
          <h1>Login</h1>
        </legend>
        <form onSubmit={handleSubmit} className="flex flex-col m-1 p-1 text-black radius-100 border-gray-600">
          <label>Email</label>
          <input
            type="email"
            className="border border-gray-400 rounded-md p-2 mt-1"
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label>Password</label>
          <input
            type="password"
            className="border border-gray-400 rounded-md p-2 mt-1"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button className="cursor-pointer" type="submit">
            {isPending ? `Logging in ...` : 'Login'}
          </button>
          {isError && <p>Error: {error instanceof Error ? error.message : "An unknown error occurred"}</p>}
        </form>
      </fieldset>
    </div>
  );
};

export default Login;