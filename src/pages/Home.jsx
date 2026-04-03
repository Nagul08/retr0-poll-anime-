import { Link } from 'react-router-dom'
import { AuthPanel } from '../components/AuthPanel'
import { LogoWordmark } from '../components/LogoWordmark'

export function Home({ featuredPoll }) {
  const topOption = featuredPoll?.options?.slice().sort((a, b) => b.votes - a.votes)[0]

  return (
    <div className="page home-page">
      <header className="hero-panel">
        <LogoWordmark />
        <p className="tagline">A neon battleground for anime rankings and hot takes.</p>
        <div className="hero-actions">
          <Link className="neon-button" to="/polls">
            Browse polls
          </Link>
          <Link className="ghost-button" to={featuredPoll ? `/polls/${featuredPoll.id}` : '/polls'}>
            Jump to featured
          </Link>
        </div>
      </header>

      <section className="featured-block">
        <div>
          <p className="eyebrow">Featured Poll</p>
          <h2>{featuredPoll?.title ?? 'Loading the arena...'}</h2>
          <p>{featuredPoll?.description ?? 'Fetching current showdown.'}</p>
        </div>

        {topOption ? (
          <div className="featured-highlight">
            <span>Current leader</span>
            <strong>{topOption.label}</strong>
            <small>{topOption.votes} votes</small>
          </div>
        ) : null}
      </section>

      <AuthPanel />
    </div>
  )
}
