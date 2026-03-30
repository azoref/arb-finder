'use client'

export default function BlinkingCursor() {
  return (
    <span
      className="inline-block w-[3px] h-[1em] bg-green-400 ml-1 align-middle animate-blink"
      aria-hidden="true"
    />
  )
}
