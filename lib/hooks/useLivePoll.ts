'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLivePollOptions {
  enabled?: boolean
  immediate?: boolean
}

export function useLivePoll<T>(
  url: string | null,
  intervalMs: number = 3000,
  options: UseLivePollOptions = {}
) {
  const { enabled = true, immediate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const isMounted = useRef<boolean>(true)

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return

    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
      }
      const json = await res.json()
      if (isMounted.current) {
        setData(json)
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      if (isMounted.current) {
        console.error(`[useLivePoll] Error fetching ${url}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }
  }, [url, enabled])

  useEffect(() => {
    isMounted.current = true

    if (immediate) {
      fetchData()
    }

    if (!enabled || !url || intervalMs <= 0) {
      return () => {
        isMounted.current = false
      }
    }

    const intervalId = setInterval(fetchData, intervalMs)

    return () => {
      isMounted.current = false
      clearInterval(intervalId)
    }
  }, [fetchData, intervalMs, enabled, url, immediate])

  return { data, loading, error, refresh: fetchData }
}
