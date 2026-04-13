'use client'

import { useEffect, useState } from 'react'

export default function ArbCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/arbs/count')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {})
  }, [])

  if (count === null) return null

  return (
    <p className="mt-8 text-sm text-[#6b6b80]">
      <span className="font-mono text-green-400 text-base font-semibold">{count.toLocaleString()}</span>
      {' '}arbs found today
    </p>
  )
}
