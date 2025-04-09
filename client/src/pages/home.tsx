import useAuthStore from "@/stores/auth.store";
import React from "react";

const Home: React.FC = () => {
	const user = useAuthStore((state) => state.user);
	console.log(user);

	return (
		<>
			<h1>Art Home</h1>
			{user ? (
				<div className="flex items-center mb-8">
					<h1 className="text-2xl font-bold">Art-Home</h1>
					<p className="ml-4 text-gray-600">Welcome {user.username}</p>
				</div>
			) : (
				<p className="text-gray-600">Welcome, Guest! Please log in to access more features.</p>
			)}
			<div className="max-w-5xl mx-auto p-4">
				{/* Header */}
				<div className="flex items-center mb-8">
					<h1 className="text-2xl font-bold">Art-Home</h1>
					<p className="ml-4 text-gray-600">{user ? `Welcome ${user.username}` : "Welcome, Guest!"}</p>
				</div>

				{/* Gallery Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Add your gallery items here */}
					<p>Gallery items will be displayed here.</p>
				</div>
			</div>
			{/* Footer */}
			<footer className="bg-gray-800 text-white py-4">
				<div className="max-w-5xl mx-auto text-center">
					<p>&copy; 2023 Art Home. All rights reserved.</p>
				</div>
			</footer>
		</>
	);
};

export default Home;
