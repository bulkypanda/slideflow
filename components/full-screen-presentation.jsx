import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export function FullScreenPresentation({ images, onClose, initialSlideIndex, onUpdateSlideTimes }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex)
  const [slideTimes, setSlideTimes] = useState(images.map(() => 0))
  const [startTime, setStartTime] = useState(Date.now())

  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < images.length - 1) {
      const newSlideTimes = [...slideTimes]
      newSlideTimes[currentSlideIndex] += (Date.now() - startTime) / 1000
      setSlideTimes(newSlideTimes)
      setCurrentSlideIndex(currentSlideIndex + 1)
      setStartTime(Date.now())
    }
  }, [currentSlideIndex, images.length, slideTimes, startTime])

  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const newSlideTimes = [...slideTimes]
      newSlideTimes[currentSlideIndex] += (Date.now() - startTime) / 1000
      setSlideTimes(newSlideTimes)
      setCurrentSlideIndex(currentSlideIndex - 1)
      setStartTime(Date.now())
    }
  }, [currentSlideIndex, slideTimes, startTime])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight') {
      goToNextSlide()
    } else if (event.key === 'ArrowLeft') {
      goToPreviousSlide()
    } else if (event.key === 'Escape') {
      onClose()
    }
  }, [goToNextSlide, goToPreviousSlide, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideTimes(prevTimes => {
        const newTimes = [...prevTimes]
        newTimes[currentSlideIndex] += 1
        return newTimes
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSlideIndex])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <img
        src={images[currentSlideIndex]}
        alt={`Slide ${currentSlideIndex + 1}`}
        className="max-h-full max-w-full object-contain"
      />
      <div className="absolute top-4 right-4 flex space-x-4">
        <Button variant="outline" size="icon" onClick={() => {
          onUpdateSlideTimes(slideTimes);
          onClose();
        }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <Button variant="outline" size="icon" onClick={goToPreviousSlide}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-white">
          Slide {currentSlideIndex + 1} of {images.length} | 
          Time on slide: {Math.floor(slideTimes[currentSlideIndex])}s
        </span>
        <Button variant="outline" size="icon" onClick={goToNextSlide}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
