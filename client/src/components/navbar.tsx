import { Box, Image } from "@chakra-ui/react";
import React from "react";
import useAuthStore from "../stores/auth.store"
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
	const user = useAuthStore(state => state.user);
	const isAuthenticated = useAuthStore(state => !!state.accessToken);

	return (
		<Box className="flex flex-row justify-evenly gap-10 items-center text-white p-4">
			{user?.image && (
				<Image
					src={typeof user.image === 'string'
						? user.image
						: URL.createObjectURL(user.image)}
					alt={user.username}
					boxSize="40px"
					borderRadius="full"
					marginRight="2"
				/>
			)}

			< nav className="flex gap-4 items-center">
				<Link to="/">Home</Link>
				<Link to="/gallery">Gallery</Link>
				<Link to="/chat">Chat</Link>

				{isAuthenticated ? (
					<Link to="/logout">Log out</Link>
				) : (
					<>
						<Link to="/login">Login</Link>
						<Link to="/register">Register</Link>
					</>
				)}
			</nav>
		</Box >
	);
};

export default Navbar;