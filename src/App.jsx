import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import { getExistingVote, castVote, getFeaturedPoll, listPolls } from './lib/pollsApi'
import { Home } from './pages/Home'
import { Polls } from './pages/Polls'
import { PollDetail } from './pages/PollDetail'

function PollDetailRoute({ polls, onVote }) {
  const { pollId = '' } = useParams()
  const { identityKey } = useAuth()
  const poll = polls.find((item) => item.id === pollId) ?? null

  const existingVote = poll ? getExistingVote({ pollId: poll.id, identityKey }) : null

  return <PollDetail poll={poll} existingVote={existingVote} onVote={(optionId) => onVote(pollId, optionId)} />
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
      activeCategory={safeCategory}
      onChangeCategory={onChangeCategory}
    />
  )
}

function App() {
  const { identityKey, user } = useAuth()
  const [polls, setPolls] = useState([])
  const [featuredPoll, setFeaturedPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPolls = async () => {
    try {
      setLoading(true)
      setError('')

      const [pollList, featured] = await Promise.all([listPolls(), getFeaturedPoll()])

      setPolls(pollList)
      setFeaturedPoll(featured)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  const onVote = async (pollId, optionId) => {
    await castVote({ pollId, optionId, identityKey })
    await loadPolls()
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand-link">
          retr0 poll
        </Link>
        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/polls">Polls</NavLink>
        </nav>
        <p className="identity-chip">{user ? `account:${user.username}` : 'guest mode'}</p>
      </header>

      <main>
        {error ? <p className="error-banner">{error}</p> : null}
        {loading ? <p className="loading-state">Loading polls...</p> : null}

        {!loading ? (
          <Routes>
            <Route path="/" element={<Home featuredPoll={featuredPoll} />} />
            <Route path="/polls" element={<PollsRoute polls={polls} />} />
            <Route path="/polls/:pollId" element={<PollDetailRoute polls={polls} onVote={onVote} />} />
          </Routes>
        ) : null}
      </main>
    </div>
  )
}

export default App
