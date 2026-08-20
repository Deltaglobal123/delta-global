import { useEffect } from 'react'

/** Keeps the tab title honest on routes that live outside the marketing Layout. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
