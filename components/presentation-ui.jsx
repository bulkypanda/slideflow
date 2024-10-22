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
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function PresentationUi({ images, currentSlideIndex, goToNextSlide, goToPreviousSlide, slideTimes, onUpdateSlideTimes }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const [isFullScreen, setIsFullScreen] = useState(false)

  const PLACEHOLDER_BOX_COUNT = 5;

  const timeItems = images.length > 0
    ? images.map((_, index) => ({
        id: index + 1,
        time: formatTime(slideTimes[index] || 0),
        difference: "",
      }))
    : Array(PLACEHOLDER_BOX_COUNT).fill().map((_, index) => ({
        id: index + 1,
        time: "00:00",
        difference: "",
      }));

  useEffect(() => {
    if (images.length > 0 && slideTimes.length !== images.length) {
      onUpdateSlideTimes(new Array(images.length).fill(0));
    }
  }, [images, slideTimes, onUpdateSlideTimes]);

  const startPresentation = () => {
    setIsFullScreen(true)
  }

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
              {timeItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto,1fr,auto] gap-2 items-center">
                  <span className="text-sm font-medium">{item.id}</span>
                  <div className="grid grid-cols-2 px-3 py-2 border h-10 border-black/40 rounded-md">
                    <div className="text-left border-right border-black">
                      {item.time}
                    </div>
                    <div className="text-center h-full">
                      <span className="text-sm">
                        {item.difference}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
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
        />
      )}
    </>
  );
}
