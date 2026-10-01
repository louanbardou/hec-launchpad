import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { BottomNav } from './components/BottomNav'
import { Login } from './pages/Login'
import { Feed } from './pages/Feed'
import { IdeaDetail } from './pages/IdeaDetail'
import { NewPost } from './pages/NewPost'
import { Cofounders } from './pages/Cofounders'
import { Members } from './pages/Members'
import { ProfilePage } from './pages/Profile'
import { About } from './pages/About'

function Shell() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  // Les écrans de formulaire sont en plein écran : pas de barre de navigation sous le bouton Publier.
  const fullScreen = pathname === '/new' || pathname.endsWith('/edit')
  if (loading) return <div className="min-h-dvh flex items-center justify-center muted">Chargement…</div>
  if (!user) return <Login />
  return (
    <div className="min-h-dvh">
      <Outlet />
      {!fullScreen && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Feed />} />
            <Route path="idea/:id" element={<IdeaDetail />} />
            <Route path="idea/:id/edit" element={<NewPost />} />
            <Route path="new" element={<NewPost />} />
            <Route path="cofounders" element={<Cofounders />} />
            <Route path="members" element={<Members />} />
            <Route path="u/:id" element={<ProfilePage />} />
            <Route path="me" element={<ProfilePage />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
