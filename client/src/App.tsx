import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login, { Logout } from "./pages/login";
import Register from "./pages/register";
import Gallery from "./pages/gallery";
import Chats from "./pages/chats";

function App() {

	return (
		<main className="flex flex-col m-1 p-1 text-black ">
			<h1>Art Home</h1>
			<Router>
				<Navbar />

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/gallery" element={<Gallery />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/chat" element={<Chats />} />
					<Route path="/logout" element={<Logout />} />
				</Routes>
			</Router>

		</main>
	);
}

export default App;