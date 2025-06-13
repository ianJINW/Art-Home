import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'
import Home from './pages/home'
import Login, { Logout } from './pages/login'
import Register from './pages/register'
import Gallery from './pages/gallery'
import Chats from './pages/chats'
import CreateChat from './pages/createChat'
import Artists from './pages/artists'
import Chat from './pages/chat'

function App () {
  return (
    <main className='flex flex-col w-screen m-0 p-0 h-screen overflow-auto text-black dark:text-white bg-gray-100 dark:bg-gray-900 justify-around items-center'>
      <Router>
        <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/create-chat' element={<CreateChat />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/chat' element={<Chats />} />
          <Route path='/chat/:id' element={<Chat />} />
          <Route path='/artists' element={<Artists />} />
          <Route path='/logout' element={<Logout />} />
        </Routes>
      </Router>
    </main>
  )
}

export default App
