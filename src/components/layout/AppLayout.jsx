import { useAuth } from '@/lib/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout({ children, title = 'Dashboard' }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar onSignOut={signOut} />
      <div className="pl-60">
        <Header title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
