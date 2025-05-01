import React from "react";
import useAuthStore from "../stores/auth.store";
import { Link } from "react-router-dom";
import { Image, MessageCircle, LogOut, LogIn, UserPlus, MoonIcon, SunIcon } from "lucide-react";

const Navbar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const isDark = useAuthStore((state) => state.isDark)

  const darkMode = async () => {
    const currentDarkMode = useAuthStore.getState().isDark;
    const newDarkMode = !currentDarkMode;

    useAuthStore.setState({ isDark: newDarkMode });

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("darkMode");
    }
  }

  return (
    <header className="text-white shadow-md gap-3">
      <div className="container mx-auto flex justify-between items-center py-4 px-6 dark:bg-gray-800 ">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Art-Home
        </Link>
        {isDark ? (
          <button onClick={darkMode}>
            <SunIcon size={20} />
          </button>
        ) : (
          <button onClick={darkMode}>
            <MoonIcon size={20} />
          </button>
        )}

        {/* Navigation Links */}
        <nav className="flex gap-6 items-center">
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
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              <LogOut size={20} />
              Log out
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                <LogIn size={20} className="text-white" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
              >
                <UserPlus size={20} className="text-white" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;