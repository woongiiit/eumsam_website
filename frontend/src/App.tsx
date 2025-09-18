import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Board from './pages/Board'
import Gallery from './pages/Gallery'
import GalleryDetail from './pages/GalleryDetail'
import Application from './pages/Application'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import MyPage from './pages/MyPage'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="board" element={<Board />} />
          <Route path="board/:id" element={<PostDetail />} />
          <Route path="board/create" element={<CreatePost />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/:id" element={<GalleryDetail />} />
          <Route path="application" element={<Application />} />
          <Route path="admin" element={<Admin />} />
          <Route path="mypage" element={<MyPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
