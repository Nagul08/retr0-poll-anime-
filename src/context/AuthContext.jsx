import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context'

const USER_STORAGE = 'anime-poll-auth-user'
const USERS_DB_STORAGE = 'anime-poll-users-db'
const GUEST_STORAGE = 'anime-poll-guest-id'

const readUsersDb = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_DB_STORAGE) ?? '{}')
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

const writeUsersDb = (value) => {
  localStorage.setItem(USERS_DB_STORAGE, JSON.stringify(value))
}

const createGuestId = () => {
  const randomTail = Math.random().toString(36).slice(2, 10)
  return `guest-${Date.now()}-${randomTail}`
}

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

const getInitialGuestId = () => {
  const storedGuestId = localStorage.getItem(GUEST_STORAGE)
  if (storedGuestId) {
    return storedGuestId
  }

  const newGuestId = createGuestId()
  localStorage.setItem(GUEST_STORAGE, newGuestId)
  return newGuestId
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)
  const [guestId] = useState(getInitialGuestId)

  const signUp = ({ username, password }) => {
    const normalized = username.trim().toLowerCase()
    if (!normalized || password.length < 6) {
      throw new Error('Username is required and password must be at least 6 characters.')
    }

    const users = readUsersDb()
    if (users[normalized]) {
      throw new Error('Username already exists. Pick another one.')
    }

    users[normalized] = {
      username: normalized,
      password,
      createdAt: new Date().toISOString(),
    }
    writeUsersDb(users)

    const nextUser = {
      id: normalized,
      username: normalized,
      type: 'account',
    }

    localStorage.setItem(USER_STORAGE, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const signIn = ({ username, password }) => {
    const normalized = username.trim().toLowerCase()
    const users = readUsersDb()

    const account = users[normalized]
    if (!account || account.password !== password) {
      throw new Error('Invalid username or password.')
    }

    const nextUser = {
      id: normalized,
      username: normalized,
      type: 'account',
    }

    localStorage.setItem(USER_STORAGE, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const signOut = () => {
    localStorage.removeItem(USER_STORAGE)
    setUser(null)
  }

  const identityKey = user ? `account:${user.id}` : `guest:${guestId}`

  const value = useMemo(
    () => ({
      user,
      guestId,
      identityKey,
      signUp,
      signIn,
      signOut,
    }),
    [user, guestId, identityKey],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
