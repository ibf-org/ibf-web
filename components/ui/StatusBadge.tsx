type StatusType = 'open' | 'paused' | 'closed' | 'pending' | 'reviewing' | 'accepted' | 'rejected' | string

const statusConfig: Record<string, { dotClass: string; badgeClass: string; label: string }> = {
  open:      { dotClass: 'bg-emerald-400', badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-400', label: 'Open' },
  paused:    { dotClass: 'bg-amber-400',   badgeClass: 'border-amber-400/30 bg-amber-500/15 text-amber-400',     label: 'Paused' },
  closed:    { dotClass: 'bg-gray-400',    badgeClass: 'border-gray-400/30 bg-gray-500/15 text-gray-400',        label: 'Closed' },
  pending:   { dotClass: 'bg-blue-400',    badgeClass: 'border-blue-400/30 bg-blue-500/15 text-blue-400',        label: 'Pending' },
  reviewing: { dotClass: 'bg-amber-400',   badgeClass: 'border-amber-400/30 bg-amber-500/15 text-amber-400',     label: 'Reviewing' },
  accepted:  { dotClass: 'bg-emerald-400', badgeClass: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-400', label: 'Accepted' },
  rejected:  { dotClass: 'bg-red-400',     badgeClass: 'border-red-400/30 bg-red-500/15 text-red-400',           label: 'Rejected' },
}

const fallback = { dotClass: 'bg-gray-400', badgeClass: 'border-gray-400/30 bg-gray-500/15 text-gray-400', label: '' }

export default function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status] || { ...fallback, label: status }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${config.badgeClass}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  )
}
