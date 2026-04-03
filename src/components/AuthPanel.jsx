import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export function AuthPanel() {
  const { user, signOut, signIn, signUp, authEnabled } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        await signUp({ email, password })
        setMessage('Account created. Check your email for confirmation link.')
      } else {
        await signIn({ email, password })
        setMessage('Signed in successfully.')
      }

      setPassword('')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return (
      <section className="auth-panel">
        <p>
          Signed in as <strong>{user.email}</strong>
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
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
        <button className="neon-button" type="submit" disabled={!authEnabled || isSubmitting}>
          {isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="auth-help">
        Voting requires email and password login.
        {!authEnabled ? ' Add Supabase env keys to enable login.' : ''}
      </p>
      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  )
}
