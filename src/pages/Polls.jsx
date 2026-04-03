import { useMemo } from 'react'
import { PollCard } from '../components/PollCard'
import { PollFilters } from '../components/PollFilters'

export function Polls({ polls, activeCategory, onChangeCategory }) {
  const categories = useMemo(() => {
    const unique = new Set(polls.map((poll) => poll.category))
    return ['All', ...unique]
  }, [polls])

  return (
    <div className="page polls-page">
      <div className="page-title-wrap">
        <h2>Anime Poll Arena</h2>
        <p>Pick your category and vote once per identity.</p>
      </div>

      <PollFilters
        categories={categories}
        activeCategory={activeCategory}
        onChange={onChangeCategory}
      />

      {polls.length ? (
        <section className="poll-grid">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </section>
      ) : (
        <p className="empty-state">No polls in this category yet.</p>
      )}
    </div>
  )
}
