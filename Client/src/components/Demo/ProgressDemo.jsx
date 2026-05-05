import { useState,useEffect } from 'react'
import { Progress } from '../ui/progress'

export function ProgressDemo() {
  const [progress, setProgress] = useState(13)
 
  useEffect(() => {
    let timer
    let count = 13
    const updateProgress = () => {
      if (count < 100) {
        setProgress(count)
        count++
        timer = setTimeout(updateProgress, 50)
      }
    }
    timer = setTimeout(updateProgress, 500)
    return () => clearTimeout(timer)
  }, [])
  return <Progress value={progress} className='w-1/3'/>
}