import { mockPolls } from '../data/mockPolls'
import { supabase } from './supabaseClient'

const STORAGE_KEY = 'anime-poll-local-votes'

const clonePoll = (poll) => ({
  ...poll,
  options: poll.options.map((option) => ({ ...option })),
})

const readLocalVotes = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

const writeLocalVotes = (votesByIdentity) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votesByIdentity))
}

const hydratePollVotes = (basePolls) => {
  const votesByIdentity = readLocalVotes()
  const voteCounts = {}

  Object.values(votesByIdentity).forEach((identityVotes) => {
    Object.values(identityVotes).forEach((optionId) => {
      voteCounts[optionId] = (voteCounts[optionId] ?? 0) + 1
    })
  })

  return basePolls.map((poll) => ({
    ...clonePoll(poll),
    options: poll.options.map((option) => ({
      ...option,
      votes: option.votes + (voteCounts[option.id] ?? 0),
    })),
  }))
}

const getIdentityVote = (identityKey, pollId) => {
  const votesByIdentity = readLocalVotes()
  return votesByIdentity[identityKey]?.[pollId] ?? null
}

const setIdentityVote = (identityKey, pollId, optionId) => {
  const votesByIdentity = readLocalVotes()
  const identityVotes = votesByIdentity[identityKey] ?? {}
  identityVotes[pollId] = optionId
  votesByIdentity[identityKey] = identityVotes
  writeLocalVotes(votesByIdentity)
}

const formatSupabasePoll = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  description: row.description,
  featured: row.featured,
  options: row.poll_options
    .map((option) => ({
      id: option.id,
      label: option.label,
      votes: option.votes_count ?? 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label)),
})

export const listPolls = async ({ category = 'All' } = {}) => {
  if (supabase) {
    let query = supabase
      .from('polls')
      .select('id,title,category,description,featured,poll_options(id,label,votes_count)')
      .order('created_at', { ascending: false })

    if (category !== 'All') {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error

    return data.map(formatSupabasePoll)
  }

  const polls = hydratePollVotes(mockPolls)
  if (category === 'All') return polls
  return polls.filter((poll) => poll.category === category)
}

export const getFeaturedPoll = async () => {
  const polls = await listPolls()
  return polls.find((poll) => poll.featured) ?? polls[0] ?? null
}

export const getPollById = async (pollId) => {
  const polls = await listPolls()
  return polls.find((poll) => poll.id === pollId) ?? null
}

export const castVote = async ({ pollId, optionId, identityKey }) => {
  if (supabase) {
    const { error } = await supabase.from('votes').insert({
      poll_id: pollId,
      option_id: optionId,
      identity_key: identityKey,
    })

    if (error) throw error
    return { success: true }
  }

  const existingVote = getIdentityVote(identityKey, pollId)
  if (existingVote) {
    throw new Error('You already voted on this poll with this identity.')
  }

  setIdentityVote(identityKey, pollId, optionId)
  return { success: true }
}

export const getExistingVote = ({ pollId, identityKey }) => {
  if (!identityKey) return null
  return getIdentityVote(identityKey, pollId)
}
