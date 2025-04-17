import React, { useState, ChangeEvent } from "react";
import { RegisterUser } from "../utils/api";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  image: File | null;
}

const Register: React.FC = () => {
  // Local state for form fields
  const [data, setData] = useState<RegisterFormData>({
    email: "",
    password: "",
    username: "",
    image: null,
  });

  const { mutate, isPending, isError, error } = RegisterUser();

  // Handler for form submission: create a FormData object
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a FormData instance and append fields for file upload
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("username", data.username);
    if (data.image) {
      formData.append("profile", data.image);
    }

    // Trigger the mutation with the FormData
    mutate(formData);
  };

  // Handler for file input change event
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) { 
      setData({ ...data, image: e.target.files[0] });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <fieldset className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <legend className="text-2xl font-bold text-orange-500 dark:text-blue-400 mb-4">
          Register
        </legend>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          encType="multipart/form-data"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-gray-700 dark:text-gray-300 mb-1"
            >
              Profile Image
            </label>
            <input
              id="image"
              name="profile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-blue-400"
            />
          </div>

          <button
            className="w-full bg-orange-500 text-white rounded-md p-2 hover:bg-orange-600 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Registering ..." : "Register"}
          </button>
          {isError && (
            <p className="text-red-500 mt-2">
              Error: {error?.message || "An error occurred"}
            </p>
          )}
        </form> 
      </fieldset>
    </div>
  );
};

export default Register;