import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Hotel, LayoutDashboard, Building2, Search, CalendarCheck, FileBarChart, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Sidebar.module.css'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/hotels', label: 'Hotel Catalog', icon: Building2 },
  { path: '/search', label: 'Search Availability', icon: Search },
  { path: '/stays', label: 'Stay Management', icon: CalendarCheck },
  { path: '/reports', label: 'Performance Reports', icon: FileBarChart },
]

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Hotel size={20} />
          </div>
          <div>
            <h1 className={styles.brandName}>E-Hotel</h1>
            <p className={styles.brandTagline}>Resort Management</p>
          </div>
        </div>
        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`${styles.content} ${isOpen ? styles.contentVisible : ''}`}>
        <nav className={styles.nav}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
