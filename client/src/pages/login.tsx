import React, { useEffect, useState } from "react";
import { LoginUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import AuthStore from "../stores/auth.store";

const Login: React.FC = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const user = AuthStore((state) => state.user);
  const { mutate, isPending, isError, error } = LoginUser();


  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      username: data.email, // Assuming email is used as the username
      email: data.email,
      password: data.password,
    };

    mutate(formData);
  };

  return (
    <div>
      <fieldset className="border-dotted border-4 border-light-blue-500 radius-600">
        <legend>
          <h1>Login</h1>
        </legend>
        <form onSubmit={handleSubmit} className="flex flex-col m-1 p-1 text-black radius-100 border-gray-600">
          <label>Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label>Password</label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button className="cursor-pointer" type="submit">
            {isPending ? `Logging in ...` : 'Login'}
          </button>
          {isError && <p>Error: {error?.message}</p>}
        </form>
      </fieldset>
    </div>
  );
};

export default Login;