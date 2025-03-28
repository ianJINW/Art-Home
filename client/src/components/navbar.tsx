import AuthStore from "@/stores/auth.store";
import { Box, Image } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
	const { user } = AuthStore((state) => ({
		user: state.user,
	}));



	return (
		<Box className="flex flex-row justify-evenly gap-10 align-center text-white p-4">
			{user?.image && (
				<Image
					src={typeof user.image === "string" ? user.image : URL.createObjectURL(user.image)}
					alt={user?.username}
				/>
			)}

			<nav>
				<Link to="/">Home</Link>
				<Link to="/gallery">Gallery</Link>
				<Link to="/login">Login</Link>
				<Link to="/register">Register</Link>
				<Link to="/chat">Chat</Link>
			</nav>
		</Box>
	);
};

export default Navbar;
