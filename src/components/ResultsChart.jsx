import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const colors = ['#9a00ff', '#33ff57', '#00e6ff', '#ff3377', '#ffd400']

export function ResultsChart({ options }) {
  const data = options.map((option, index) => ({
    name: option.label,
    votes: option.votes,
    color: colors[index % colors.length],
  }))

  return (
    <div className="chart-wrap" role="img" aria-label="Poll results bar chart">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 48 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.12)" />
          <XAxis dataKey="name" angle={-16} textAnchor="end" interval={0} height={72} />
          <YAxis allowDecimals={false} />
          <Tooltip cursor={{ fill: 'rgba(154, 0, 255, 0.15)' }} />
          <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
