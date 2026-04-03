import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { supabase } from '../lib/supabaseClient'

const USER_STORAGE = 'anime-poll-auth-user'

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
    type: 'email',
  }
}

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

  const signUp = async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Email login requires Supabase credentials in your .env file.')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    })

    if (error) {
      throw error
    }

    return { success: true }
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Email login requires Supabase credentials in your .env file.')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      throw error
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
