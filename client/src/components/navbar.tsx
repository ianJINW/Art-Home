import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
	return (
		<nav className="flex flex-row justify-evenly gap-10 align-center text-white p-4">
			<Link to="/">Home</Link>
			<Link to="/about">About</Link>
			<Link to="/login">Login</Link>
			<Link to="/register">Register</Link>
		</nav>
	);
};

export default Navbar;
