import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"

const WarningNotification = ({ message }) => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center">
    <AlertTriangle className="mr-2 h-4 w-4" />
    <span>{message}</span>
  </div>
);

const SpeakerNotes = ({ notes }) => (
  <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
    <h3 className="text-lg font-semibold mb-2">Speaker Notes</h3>
    <p className="text-sm">{notes}</p>
  </div>
);

export function FullScreenPresentation({ images, onClose, initialSlideIndex, onUpdateSlideTimes, plannedTimes, isSpeakerView, speakerNotes }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex)
  const [slideTimes, setSlideTimes] = useState(plannedTimes.map(() => 0))
  const [startTime, setStartTime] = useState(Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < images.length - 1) {
      const newSlideTimes = [...slideTimes];
      newSlideTimes[currentSlideIndex] = elapsedTime;
      setSlideTimes(newSlideTimes);
      setCurrentSlideIndex(currentSlideIndex + 1);
      setStartTime(Date.now());
      setElapsedTime(0);
      setShowWarning(false);
    }
  }, [currentSlideIndex, images.length, slideTimes, elapsedTime]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      const newSlideTimes = [...slideTimes];
      newSlideTimes[currentSlideIndex] = elapsedTime;
      setSlideTimes(newSlideTimes);
      setCurrentSlideIndex(currentSlideIndex - 1);
      setStartTime(Date.now());
      setElapsedTime(0);
      setShowWarning(false);
    }
  }, [currentSlideIndex, slideTimes, elapsedTime]);

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
      const currentTime = Math.round((Date.now() - startTime) / 1000);
      setElapsedTime(currentTime);

      const plannedTime = plannedTimes[currentSlideIndex];
      if (currentTime >= plannedTime * 0.8 && currentTime < plannedTime) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSlideIndex, startTime, plannedTimes]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="relative w-full h-full">
        <img
          src={images[currentSlideIndex]}
          alt={`Slide ${currentSlideIndex + 1}`}
          className="max-h-full max-w-full object-contain mx-auto"
        />
        {showWarning && (
          <WarningNotification message="Approaching planned time!" />
        )}
        <div className="absolute top-4 right-4 flex space-x-4">
          <Button variant="outline" size="icon" onClick={() => {
            const finalSlideTimes = [...slideTimes];
            finalSlideTimes[currentSlideIndex] = elapsedTime;
            onUpdateSlideTimes(finalSlideTimes);
            onClose();
          }} className="bg-gray-800 text-gray-200 hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousSlide} className="bg-gray-800 text-gray-200 hover:bg-gray-700">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white bg-gray-800 px-4 py-2 rounded-md">
            Slide {currentSlideIndex + 1} of {images.length} | 
            Time on slide: {elapsedTime}s
          </span>
          <Button variant="outline" size="icon" onClick={goToNextSlide} className="bg-gray-800 text-gray-200 hover:bg-gray-700">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {isSpeakerView && (
          <SpeakerNotes notes={speakerNotes[currentSlideIndex] || 'No speaker notes for this slide.'} />
        )}
      </div>
    </div>
  )
}
