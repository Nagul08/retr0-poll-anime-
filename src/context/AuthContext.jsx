import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { supabase } from '../lib/supabaseClient'

const USER_STORAGE = 'anime-poll-auth-user'
const AUTH_NAME_DOMAIN = 'retr0.local'

const getInitialUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE)
  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(USER_STORAGE)
    return null
  }
}

const toProviderUser = (authUser) => {
  if (!authUser) {
    return null
  }

  const email = authUser.email ?? ''
  const fallbackName = email ? email.split('@')[0] : 'user'
  const displayName = authUser.user_metadata?.username || fallbackName

  return {
    id: authUser.id,
    username: displayName,
    email,
    type: 'name',
  }
}

const normalizeName = (name) => (name ?? '').trim().toLowerCase()

const toAuthEmail = (name) => `${normalizeName(name).replace(/[^a-z0-9._-]/g, '-')}@${AUTH_NAME_DOMAIN}`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) {
        return
      }

      const providerUser = toProviderUser(data.session?.user ?? null)
      if (providerUser) {
        localStorage.setItem(USER_STORAGE, JSON.stringify(providerUser))
        setUser(providerUser)
      }
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const providerUser = toProviderUser(session?.user ?? null)

      if (providerUser) {
        localStorage.setItem(USER_STORAGE, JSON.stringify(providerUser))
        setUser(providerUser)
      } else {
        localStorage.removeItem(USER_STORAGE)
        setUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = () => {
    if (supabase) {
      supabase.auth.signOut()
    }

    localStorage.removeItem(USER_STORAGE)
    setUser(null)
  }

  const signUp = async ({ name, password }) => {
    if (!supabase) {
      throw new Error('Name login requires Supabase credentials in your .env file.')
    }

    const normalizedName = normalizeName(name)
    if (!normalizedName) {
      throw new Error('Name is required.')
    }

    const authEmail = toAuthEmail(normalizedName)
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          username: normalizedName,
        },
      },
    })

    if (error) {
      const message = error.message || 'Sign up failed due to an authentication service error.'
      if (/confirmation email|error sending confirmation email|smtp/i.test(message)) {
        throw new Error(
          'Supabase is trying to send a confirmation email. Disable Auth > Providers > Email > Confirm email in Supabase, or configure SMTP credentials.',
        )
      }
      throw new Error(message)
    }

    if (!data?.user) {
      throw new Error(
        'Sign up returned an empty response from auth service.',
      )
    }

    if (!data?.session) {
      const signInResult = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      })

      if (signInResult.error) {
        throw new Error(signInResult.error.message || 'Account created but automatic sign in failed.')
      }
    }

    return {
      success: true,
    }
  }

  const signIn = async ({ name, password }) => {
    if (!supabase) {
      throw new Error('Name login requires Supabase credentials in your .env file.')
    }

    const normalizedName = normalizeName(name)
    if (!normalizedName) {
      throw new Error('Name is required.')
    }

    const authEmail = toAuthEmail(normalizedName)
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    if (error) {
      throw new Error(error.message || 'Sign in failed due to an authentication service error.')
    }

    return { success: true }
  }

  const identityKey = user ? `account:${user.id}` : null
  const authEnabled = Boolean(supabase)
  const isAuthenticated = Boolean(user)

  const value = useMemo(
    () => ({
      user,
      identityKey,
      isAuthenticated,
      authEnabled,
      signUp,
      signIn,
      signOut,
    }),
    [user, identityKey, isAuthenticated, authEnabled],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
