import clsx from 'clsx'

export function PollFilters({ categories, activeCategory, onChange }) {
  return (
    <div className="filter-wrap" role="tablist" aria-label="Filter poll categories">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={category === activeCategory}
          className={clsx('chip', category === activeCategory && 'chip-active')}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
