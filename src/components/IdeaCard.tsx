import { Link } from 'react-router-dom'
import type { Idea } from '../lib/types'
import { STAGE_LABEL } from '../lib/types'
import { timeAgo } from '../lib/format'
import { Avatar } from './Avatar'
import { VoteButton } from './VoteButton'

export function IdeaCard({ idea, onVote }: { idea: Idea; onVote: (id: string) => void }) {
  return (
    <article className="card p-4 flex gap-3">
      <VoteButton count={idea.vote_count} active={idea.voted_by_me} onClick={() => onVote(idea.id)} />
      <Link to={`/idea/${idea.id}`} className="flex-1 min-w-0 block">
        <div className="flex items-center gap-2 text-xs muted mb-1">
          <Avatar name={idea.author_name} src={idea.author_avatar} size={20} />
          <span className="truncate">{idea.author_name}</span>
          <span>·</span>
          <span>{timeAgo(idea.created_at)}</span>
          <span className="ml-auto chip !min-h-[22px] !text-[10px]">{STAGE_LABEL[idea.stage]}</span>
        </div>
        <h2 className="font-bold text-[17px] leading-snug">{idea.title}</h2>
        <p className="text-sm mt-1 line-clamp-3">{idea.pitch}</p>
        <div className="flex items-center gap-3 mt-2 text-xs muted">
          {idea.needs.length > 0 && <span className="truncate">Cherche : {idea.needs.join(', ')}</span>}
          <span className="ml-auto shrink-0">💬 {idea.comment_count}</span>
        </div>
      </Link>
    </article>
  )
}
