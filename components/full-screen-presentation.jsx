import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"

const WarningNotification = ({ message }) => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center">
    <AlertTriangle className="mr-2 h-4 w-4" />
    <span>{message}</span>
  </div>
);

export function FullScreenPresentation({ images, onClose, initialSlideIndex, onUpdateSlideTimes, plannedTimes }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex)
  const [slideTimes, setSlideTimes] = useState(plannedTimes)
  const [startTime, setStartTime] = useState(Date.now())
  const [showWarning, setShowWarning] = useState(false)

  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < images.length - 1) {
      const newSlideTimes = [...slideTimes];
      newSlideTimes[currentSlideIndex] = Math.round((Date.now() - startTime) / 1000);
      setSlideTimes(newSlideTimes);
      setCurrentSlideIndex(currentSlideIndex + 1);
      setStartTime(Date.now());
      setShowWarning(false);
    }
  }, [currentSlideIndex, images.length, slideTimes, startTime]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const newSlideTimes = [...slideTimes];
      newSlideTimes[currentSlideIndex] = Math.round((Date.now() - startTime) / 1000);
      setSlideTimes(newSlideTimes);
      setCurrentSlideIndex(currentSlideIndex - 1);
      setStartTime(Date.now());
      setShowWarning(false);
    }
  }, [currentSlideIndex, slideTimes, startTime]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowRight') {
      goToNextSlide();
    } else if (event.key === 'ArrowLeft') {
      goToPreviousSlide();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [goToNextSlide, goToPreviousSlide, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideTimes(prevTimes => {
        const newTimes = [...prevTimes];
        const currentTime = Math.round((Date.now() - startTime) / 1000);
        newTimes[currentSlideIndex] = currentTime;

        // Check if in the last 1/5th of planned time
        const plannedTime = plannedTimes[currentSlideIndex];
        if (currentTime >= plannedTime * 0.8 && currentTime < plannedTime) {
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }

        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSlideIndex, startTime, plannedTimes]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <img
        src={images[currentSlideIndex]}
        alt={`Slide ${currentSlideIndex + 1}`}
        className="max-h-full max-w-full object-contain"
      />
      {showWarning && (
        <WarningNotification message="Approaching planned time!" />
      )}
      <div className="absolute top-4 right-4 flex space-x-4">
        <Button variant="outline" size="icon" onClick={() => {
          const finalSlideTimes = [...slideTimes];
          finalSlideTimes[currentSlideIndex] = Math.round((Date.now() - startTime) / 1000);
          console.log("Slide times on exit:");
          finalSlideTimes.forEach((actualTime, index) => {
            console.log(`Slide ${index + 1}: Planned: ${plannedTimes[index]}s, Actual: ${actualTime}s`);
          });
          onUpdateSlideTimes(finalSlideTimes);
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
