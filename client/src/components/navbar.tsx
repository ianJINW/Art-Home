import { Box, Image } from "@chakra-ui/react";
import React from "react";
import AuthStore from "@/stores/auth.store";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
	const user = AuthStore((state) => state.user);
	const isAuth = AuthStore((state) => state.isAuth)

	return (
		<Box className="flex flex-row justify-evenly gap-10 align-center text-white p-4">
			{/* {user !== null ?
				(user?.image && (
					<Image
						src={typeof user.image === "string" ? user.image : URL.createObjectURL(user.image)}
						alt={user?.username}
					/>
				))
				: <h3>Welcome. Feel Art-Home</h3>} */}

			<nav>
				<Link to="/">Home</Link>
				<Link to="/gallery">Gallery</Link>
				{
					isAuth === null ?
						<>
							<Link to="/login">Login</Link>
							<Link to="/register">Register</Link>
						</>
						:
						<Link to="/logout" >Log out</Link>

				}
				<Link to="/chat">Chat</Link>
			</nav>
		</Box>
	);
};

export default Navbar;
