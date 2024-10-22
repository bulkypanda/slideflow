"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, Edit, Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { FullScreenPresentation } from "./full-screen-presentation"

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatTimeDifference(seconds) {
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const remainingSeconds = Math.floor(absSeconds % 60);
  const sign = seconds >= 0 ? '+' : '-';
  return `${sign}${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function isValidTimeFormat(value) {
  return /^\d{1,2}:\d{2}$/.test(value);
}

export function PresentationUi({ images, currentSlideIndex, goToNextSlide, goToPreviousSlide, slideTimes, onUpdateSlideTimes }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [timeItems, setTimeItems] = useState([])

  const PLACEHOLDER_BOX_COUNT = 5;

  useEffect(() => {
    const initialTimeItems = images.length > 0
      ? images.map((_, index) => ({
          id: index + 1,
          plannedTime: 0,
          actualTime: slideTimes[index] || 0,
          difference: "",
        }))
      : Array(PLACEHOLDER_BOX_COUNT).fill().map((_, index) => ({
          id: index + 1,
          plannedTime: 0,
          actualTime: 0,
          difference: "",
        }));
    setTimeItems(initialTimeItems);
  }, [images, slideTimes]);

  useEffect(() => {
    if (images.length > 0 && slideTimes.length === images.length) {
      const newTimeItems = timeItems.map((item, index) => ({
        ...item,
        actualTime: slideTimes[index],
        difference: formatTimeDifference(slideTimes[index] - item.plannedTime),
      }));
      setTimeItems(newTimeItems);
    }
  }, [images, slideTimes]);

  const startPresentation = () => {
    setIsFullScreen(true)
    onUpdateSlideTimes(timeItems.map(item => item.plannedTime))
  }

  const handlePlannedTimeChange = (index, value) => {
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(value)) {
      const [hours, minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
      const newTimeItems = [...timeItems];
      newTimeItems[index] = {
        ...newTimeItems[index],
        plannedTime: totalSeconds
      };
      setTimeItems(newTimeItems);
    }
  };

  return (
    <>
      <div className="w-full mx-auto px-5 mt-4 space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="ml-auto" onClick={startPresentation}>
            Present
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-4 col-span-3 h-full">
            <div className="border rounded-lg h-full p-4 flex flex-col">
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="icon">
                  <Maximize2 className="h-4 w-4"/>
                </Button>
              </div>
              <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-lg min-h-[200px]">
                {images.length > 0 ? (
                  <img src={images[currentSlideIndex]} alt={`Slide ${currentSlideIndex + 1}`} className="object-contain max-h-full max-w-full" />
                ) : (
                  <span className="text-2xl text-gray-400">No slides available</span>
                )}
              </div>
              <div className="flex items-center mt-4 justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={goToPreviousSlide}>
                  <SkipBack className="h-4 w-4"/>
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextSlide}>
                  <SkipForward className="h-4 w-4"/>
                </Button>
                <Input value={currentTime} readOnly className="w-24 h-9"/>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              {timeItems.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto,1fr,1fr] gap-2 items-center"
                >
                  <span className="text-sm font-medium">{item.id}</span>
                  <input
                    type="text"
                    value={formatTime(item.plannedTime)}
                    onChange={(e) => handlePlannedTimeChange(index, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md w-full"
                    placeholder="00:00:00"
                  />
                  <div className="px-3 py-1 border border-gray-300 rounded-md flex items-center justify-center">
                    <span className={`text-sm ${item.difference.startsWith('-') ? 'text-green-500' : 'text-red-500'}`}>
                      {item.difference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setTimeItems(timeItems.map(item => ({ ...item, plannedTime: 0, actualTime: 0, difference: "" })))}>
              Reset all
            </Button>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <Textarea placeholder="Click to add speaker notes" className="min-h-[100px]" />
        </div>
      </div>
      {isFullScreen && (
        <FullScreenPresentation
          images={images}
          onClose={() => setIsFullScreen(false)}
          initialSlideIndex={currentSlideIndex}
          onUpdateSlideTimes={onUpdateSlideTimes}
          plannedTimes={timeItems.map(item => item.plannedTime)}
        />
      )}
    </>
  );
}
