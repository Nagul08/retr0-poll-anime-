import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export function AuthPanel() {
  const { user, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = (event) => {
    event.preventDefault()
    setMessage('')

    try {
      if (mode === 'signup') {
        signUp({ username, password })
        setMessage('Account created. You are now signed in.')
      } else {
        signIn({ username, password })
        setMessage('Signed in successfully.')
      }

      setUsername('')
      setPassword('')
    } catch (error) {
      setMessage(error.message)
    }
  }

  if (user) {
    return (
      <section className="auth-panel">
        <p>
          Signed in as <strong>{user.username}</strong>
        </p>
        <button type="button" className="neon-button" onClick={signOut}>
          Sign out
        </button>
      </section>
    )
  }

  return (
    <section className="auth-panel">
      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          className={mode === 'signin' ? 'auth-tab auth-tab-active' : 'auth-tab'}
          aria-selected={mode === 'signin'}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          className={mode === 'signup' ? 'auth-tab auth-tab-active' : 'auth-tab'}
          aria-selected={mode === 'signup'}
          onClick={() => setMode('signup')}
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>
        <button className="neon-button" type="submit">
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-help">Guest voting works without login. Accounts are optional.</p>
      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  )
}
