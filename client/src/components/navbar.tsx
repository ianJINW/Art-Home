import React from "react";
import useAuthStore from "../stores/auth.store";
import { Link } from "react-router-dom";
import { Image, MessageCircle, LogOut, LogIn, UserPlus } from "lucide-react";

const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
      {user?.image ? (
        <img
          src={
            typeof user.image === "string"
              ? user.image
              : URL.createObjectURL(user.image)
          }
          alt={user.username}
          className="w-10 h-10 rounded-full border-2 border-orange-500 dark:border-blue-400 object-cover"
        />
      ) : (
        <Link
          to="/"
          className="text-2xl font-bold text-orange-500 dark:text-blue-400 hover:opacity-80 transition-opacity"
        >
          Art-Home
        </Link>
      )}

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          <Link
            to="/gallery"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-blue-400 transition-colors"
          >
            <Image size={20} />
            Gallery
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={20} />
            Chat
          </Link>
        </div>

        {/* User Section */}
        <div className="flex flex-col items-center gap-4">
          {user?.image && (
            <img
              src={
                typeof user.image === "string"
                  ? user.image
                  : URL.createObjectURL(user.image)
              }
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-orange-500 dark:border-blue-400 object-cover"
            />
          )}

          {isAuthenticated ? (
            <Link
              to="/logout"
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              Log out
            </Link>
          ) : (
            <div className="flex gap-10 justify-around ">
              <Link
                to="/login"
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                <LogIn size={20} />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                <UserPlus size={20} />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;