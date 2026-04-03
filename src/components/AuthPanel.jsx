import { useState } from 'react'
import { useAuth } from '../context/useAuth'

export function AuthPanel() {
  const { user, signOut, signIn, signUp, authEnabled } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toErrorMessage = (error) => {
    if (error instanceof Error && error.message) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    if (error && typeof error === 'object') {
      try {
        return `Request failed: ${JSON.stringify(error)}`
      } catch {
        return 'Request failed due to an unknown error object.'
      }
    }

    return 'Request failed due to an unexpected error.'
  }

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        await signUp({ name, password })
        setMessage('Account created and signed in successfully.')
      } else {
        await signIn({ name, password })
        setMessage('Signed in successfully.')
      }

      setPassword('')
    } catch (error) {
      setMessage(toErrorMessage(error))
    } finally {
      setIsSubmitting(false)
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
          Name
          <input
            type="text"
            autoComplete="username"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={3}
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
        Voting requires name and password login.
        {!authEnabled ? ' Add Supabase env keys to enable login.' : ''}
      </p>
      {message ? <p className="auth-message">{message}</p> : null}
    </section>
  )
}
