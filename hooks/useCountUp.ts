import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || target === 0) return
    hasRun.current = true
    const startTime = Date.now()
    
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      
      if (progress < 1) requestAnimationFrame(tick)
    }
    
    requestAnimationFrame(tick)
  }, [target, duration])
  
  return count
}
