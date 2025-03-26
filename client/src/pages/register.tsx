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
    email: '',
    password: '',
    username: '',
    image: null
  });


  const { mutate, isPending, isError, error } = RegisterUser();

  // Handler for form submission: create a FormData object
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a FormData instance and append fields for file upload
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('username', data.username);
    if (data.image) {
      formData.append('profile', data.image);
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
    <div>
      <fieldset className="border-dotted border-4 border-light-blue-500 rounded-lg">
        <legend>
          <h1>Register</h1>
        </legend>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col m-1 p-1 text-black rounded-lg border-gray-600"
          encType="multipart/form-data"
        >
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />

          <label htmlFor="image">Profile Image</label>
          <input
            id="image"
            name="profile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <button className="cursor-pointer" type="submit" disabled={isPending}>
            {isPending ? 'Registering ...' : 'Register'}
          </button>
          {isError && <p>Error: {error?.message || 'An error occurred'}</p>}
        </form>
      </fieldset>
    </div>
  );
};

export default Register;

