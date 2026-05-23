import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hotel } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      if (err.status === 429) {
        setError('Too many login attempts. Please try again later.')
      } else {
        setError(err.message || 'Invalid username or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Hotel size={28} />
          </div>
          <h1 className={styles.brandName}>E-Hotel</h1>
          <p className={styles.brandTagline}>Resort Cashier Management</p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p className={styles.error}>{error}</p>
        )}
      </form>
    </div>
  )
}

export default LoginPage
