import { Link } from 'react-router-dom'

export function PollCard({ poll }) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)

  return (
    <article className="poll-card">
      <p className="poll-category">{poll.category}</p>
      <h3>{poll.title}</h3>
      <p>{poll.description}</p>
      <div className="poll-card-footer">
        <span>{totalVotes} votes</span>
        <Link to={`/polls/${poll.id}`} className="link-button">
          Vote now
        </Link>
      </div>
    </article>
  )
}
