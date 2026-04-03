import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import { castVote, getFeaturedPoll, listPolls, listVotesByIdentity } from './lib/pollsApi'
import { supabase } from './lib/supabaseClient'
import { LogoWordmark } from './components/LogoWordmark'
import { Home } from './pages/Home'
import { Polls } from './pages/Polls'
import { PollDetail } from './pages/PollDetail'

function PollDetailRoute({ polls, existingVotesByPollId, onVote }) {
  const { pollId = '' } = useParams()
  const { isAuthenticated } = useAuth()
  const poll = polls.find((item) => item.id === pollId) ?? null
  const existingVote = poll ? (existingVotesByPollId[poll.id] ?? null) : null

  return (
    <PollDetail
      poll={poll}
      existingVote={existingVote}
      canVote={isAuthenticated}
      onVote={(optionId) => onVote(pollId, optionId)}
    />
  )
}

function PollsRoute({ polls }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'All'

  const categories = useMemo(() => ['All', ...new Set(polls.map((poll) => poll.category))], [polls])
  const safeCategory = categories.includes(activeCategory) ? activeCategory : 'All'

  const filteredPolls = safeCategory === 'All' ? polls : polls.filter((poll) => poll.category === safeCategory)

  const onChangeCategory = (nextCategory) => {
    if (nextCategory === 'All') {
      setSearchParams({})
      return
    }

    setSearchParams({ category: nextCategory })
  }

  return (
    <Polls
      polls={filteredPolls}
      categories={categories}
      activeCategory={safeCategory}
      onChangeCategory={onChangeCategory}
    />
  )
}

function App() {
  const { identityKey, user } = useAuth()
  const [polls, setPolls] = useState([])
  const [existingVotesByPollId, setExistingVotesByPollId] = useState({})
  const [featuredPoll, setFeaturedPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPolls = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true)
      }

      const [pollList, featured] = await Promise.all([listPolls(), getFeaturedPoll()])

      setPolls(pollList)
      setFeaturedPoll(featured)
      setError('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      if (showLoader) {
        setLoading(false)
      }
    }
  }, [])

  const loadUserVotes = useCallback(async () => {
    if (!identityKey) {
      setExistingVotesByPollId({})
      return
    }

    try {
      const rows = await listVotesByIdentity(identityKey)
      const nextMap = rows.reduce((acc, row) => {
        acc[row.poll_id] = row.option_id
        return acc
      }, {})
      setExistingVotesByPollId(nextMap)
    } catch {
      setExistingVotesByPollId({})
    }
  }, [identityKey])

  useEffect(() => {
    loadPolls(true)
  }, [loadPolls])

  useEffect(() => {
    loadUserVotes()
  }, [loadUserVotes])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    const channel = supabase
      .channel('live-vote-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        loadPolls(false)
        loadUserVotes()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_options' }, () => {
        loadPolls(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPolls, loadUserVotes])

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadPolls(false)
      loadUserVotes()
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [loadPolls, loadUserVotes])

  const onVote = async (pollId, optionId) => {
    if (!identityKey) {
      throw new Error('Sign in with email and password to vote.')
    }

    await castVote({ pollId, optionId, identityKey })
    await Promise.all([loadPolls(false), loadUserVotes()])
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand-link">
          <LogoWordmark compact />
        </Link>
        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/polls">Polls</NavLink>
        </nav>
        <p className="identity-chip">{user ? `user:${user.username}` : 'not signed in'}</p>
      </header>

      <main>
        {error ? <p className="error-banner">{error}</p> : null}
        {loading ? <p className="loading-state">Loading polls...</p> : null}

        {!loading ? (
          <Routes>
            <Route path="/" element={<Home featuredPoll={featuredPoll} />} />
            <Route path="/polls" element={<PollsRoute polls={polls} />} />
            <Route
              path="/polls/:pollId"
              element={
                <PollDetailRoute
                  polls={polls}
                  existingVotesByPollId={existingVotesByPollId}
                  onVote={onVote}
                />
              }
            />
            <Route
              path="*"
              element={
                <section className="page not-found-page">
                  <h2>Page not found</h2>
                  <p>This route does not exist in the arena.</p>
                  <Link className="neon-button" to="/polls">
                    Go to polls
                  </Link>
                </section>
              }
            />
          </Routes>
        ) : null}
      </main>

      <footer className="site-footer">
        <p>retr0 anime poll. One vote per identity.</p>
      </footer>
    </div>
  )
}

export default App
