import React from "react";
import useAuthStore from "../stores/auth.store";
import { Link } from "react-router-dom";
import { Home, Image, MessageCircle, LogOut, LogIn, UserPlus } from "lucide-react";

const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  return (
    <div className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400">
          Art-Home
        </Link>

        {/* Navigation Links */}
        <nav className="flex gap-6 items-center no-wrap">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Home size={20} />
            Home
          </Link>
          <Link
            to="/gallery"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Image size={20} />
            Gallery
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <MessageCircle size={20} />
            Chat
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user?.image && (
            <img
              src={
                typeof user.image === "string"
                  ? user.image
                  : URL.createObjectURL(user.image)
              }
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
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
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;