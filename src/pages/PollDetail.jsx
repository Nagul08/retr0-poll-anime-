import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { ResultsChart } from '../components/ResultsChart'

export function PollDetail({ poll, existingVote, canVote, onVote }) {
  const [voteError, setVoteError] = useState('')
  const [isVoting, setIsVoting] = useState(false)

  const totalVotes = useMemo(
    () => poll?.options?.reduce((sum, option) => sum + option.votes, 0) ?? 0,
    [poll],
  )

  if (!poll) {
    return (
      <div className="page poll-detail-page">
        <p>Poll not found.</p>
        <Link className="ghost-button" to="/polls">
          Back to polls
        </Link>
      </div>
    )
  }

  const submitVote = async (optionId) => {
    setVoteError('')
    setIsVoting(true)

    try {
      await onVote(optionId)
    } catch (error) {
      setVoteError(error.message)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="page poll-detail-page">
      <Link to="/polls" className="ghost-button">
        Back to all polls
      </Link>

      <header className="detail-head">
        <p className="eyebrow">{poll.category}</p>
        <h2>{poll.title}</h2>
        <p>{poll.description}</p>
      </header>

      <section className="vote-panel">
        {poll.options.map((option) => {
          const selected = existingVote === option.id
          const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0

          return (
            <button
              key={option.id}
              type="button"
              className={clsx('vote-option', selected && 'vote-option-selected')}
              disabled={!canVote || Boolean(existingVote) || isVoting}
              onClick={() => submitVote(option.id)}
            >
              <span>{option.label}</span>
              <span>{option.votes} votes ({percentage}%)</span>
            </button>
          )
        })}
      </section>

      {!canVote ? <p className="vote-note">Sign in with name and password to vote on this poll.</p> : null}
      {existingVote ? <p className="vote-note">You already voted on this poll.</p> : null}
      {voteError ? <p className="vote-error">{voteError}</p> : null}

      <ResultsChart options={poll.options} />
    </div>
  )
}
