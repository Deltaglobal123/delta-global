import type { Paginated } from '../../lib/types'

export function Pager({
  meta,
  page,
  onPage,
}: {
  meta: Paginated<unknown>['meta'] | null
  page: number
  onPage: (page: number) => void
}) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="pager">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span>
        Page {meta.current_page} of {meta.last_page}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page >= meta.last_page}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
