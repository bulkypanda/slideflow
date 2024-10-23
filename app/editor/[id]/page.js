"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PresentationUi } from "@/components/presentation-ui";
import { UploadModal } from "@/components/upload-modal";
import {createPresentationSkeleton, uploadImages} from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import { ThemeToggle } from "@/components/theme-toggle";

export default function Editor({ params }) {
    const { id } = params;
    const [hasPresentationBeenChosenYet, setHasPresentationBeenChosenYet] = useState(null);
    const [images, setImages] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [slideTimes, setSlideTimes] = useState([]);
    const [plannedTimes, setPlannedTimes] = useState([]);
    const [speakerNotes, setSpeakerNotes] = useState([]);
    const [presentationTitle, setPresentationTitle] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const router = useRouter();

    const handleUpdateSlideTimes = (newSlideTimes) => {
        setSlideTimes(newSlideTimes);
    };

    const handleUpdateSpeakerNotes = async (index, note) => {
        const newSpeakerNotes = [...speakerNotes];
        newSpeakerNotes[index] = note;
        setSpeakerNotes(newSpeakerNotes);

        // Save to database
        await saveSpeakerNote(id, index, note);
    };

    async function saveSpeakerNote(presentationId, slideIndex, note) {
        const { data, error } = await supabase
            .from('slides')
            .update({ speaker_notes: note })
            .eq('presentation_id', presentationId)
            .eq('slide_number', slideIndex);

        if (error) {
            console.error("Error saving speaker note:", error);
        }
    }

    const handleUpdateTitle = async (newTitle) => {
        setPresentationTitle(newTitle);
        setIsEditingTitle(false);

        // Save to database
        await savePresentationTitle(id, newTitle);
    };

    async function savePresentationTitle(presentationId, title) {
        const { data, error } = await supabase
            .from('presentations')
            .update({ title: title })
            .eq('id', presentationId);

        if (error) {
            console.error("Error saving presentation title:", error);
        }
    }

    async function convertPDFToJpeg(file) {
        const pdfjsLib = await import("pdfjs-dist/build/pdf");

        // Set the workerSrc and workerType
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
        pdfjsLib.GlobalWorkerOptions.workerType = "module";

        const pdfData = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        const numPages = pdf.numPages;
        const images = [];

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg");
            images.push(dataUrl);
        }

        return images;
    }

    async function uploadAndConvertPDF(file) {
        const { id: skeleton } = await createPresentationSkeleton({
            title: file.name,
        });
        const images = await convertPDFToJpeg(file);

        await uploadImages(skeleton, images);

        // Fetch the uploaded images
        const { data: slides, error } = await supabase
            .from('slides')
            .select('*')
            .eq('presentation_id', skeleton)
            .order('slide_number', { ascending: true });

        if (error) {
            console.error("Error fetching slides:", error);
        } else {
            setImages(slides.map(slide => slide.image_url));
        }

        setHasPresentationBeenChosenYet(false);
        return skeleton; // Return the new presentation ID
    }

    useEffect(() => {
        async function fetchPresentation() {
            if (id !== "new") {
                const { data: presentation, error: presentationError } = await supabase
                    .from('presentations')
                    .select('title')
                    .eq('id', id)
                    .single();

                if (presentationError) {
                    console.error("Error fetching presentation:", presentationError);
                } else {
                    setPresentationTitle(presentation.title);
                }

                const { data: slides, error: slidesError } = await supabase
                    .from('slides')
                    .select('*')
                    .eq('presentation_id', id)
                    .order('slide_number', { ascending: true });

                if (slidesError) {
                    console.error("Error fetching slides:", slidesError);
                } else {
                    setImages(slides.map(slide => slide.image_url));
                    setSpeakerNotes(slides.map(slide => slide.speaker_notes || ''));
                    setPlannedTimes(slides.map(slide => slide.planned_time || 0));
                    setSlideTimes(slides.map(slide => slide.actual_time || 0));
                }
            } else {
                setHasPresentationBeenChosenYet(true);
            }
        }

        fetchPresentation();
    }, [id]);

    const goToNextSlide = () => {
        setCurrentSlideIndex((prevIndex) => 
            prevIndex < images.length - 1 ? prevIndex + 1 : prevIndex
        );
    };

    const goToPreviousSlide = () => {
        setCurrentSlideIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };

    const handleUpdatePlannedTime = async (index, plannedTime) => {
        const newPlannedTimes = [...plannedTimes];
        newPlannedTimes[index] = plannedTime;
        setPlannedTimes(newPlannedTimes);

        // Save to database
        await savePlannedTime(id, index, plannedTime);
    };

    async function savePlannedTime(presentationId, slideIndex, plannedTime) {
        const { data, error } = await supabase
            .from('slides')
            .update({ planned_time: plannedTime })
            .eq('presentation_id', presentationId)
            .eq('slide_number', slideIndex);

        if (error) {
            console.error("Error saving planned time:", error);
        }
    }

    return (
        <div>
            <div className="flex items-center py-4 px-5 justify-between border-b border-black/30 dark:border-white/30">
                <div className="flex gap-6 text-xl items-center">
                    <Link href="/" className="text-2xl">
                        ⏰
                    </Link>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={presentationTitle}
                            onChange={(e) => setPresentationTitle(e.target.value)}
                            onBlur={() => handleUpdateTitle(presentationTitle)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleUpdateTitle(presentationTitle);
                                }
                            }}
                            className="font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                            autoFocus
                        />
                    ) : (
                        <h1 className="font-medium cursor-pointer dark:text-white" onClick={() => setIsEditingTitle(true)}>
                            {presentationTitle || "Untitled Presentation"}
                        </h1>
                    )}
                </div>
                <div className="flex gap-6 items-center">
                    <ThemeToggle />
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <Link href="/presentations" className="hover:text-blue-300 transition-colors dark:text-white">Presentations</Link>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
            <PresentationUi 
                images={images} 
                currentSlideIndex={currentSlideIndex}
                goToNextSlide={goToNextSlide}
                goToPreviousSlide={goToPreviousSlide}
                slideTimes={slideTimes}
                onUpdateSlideTimes={handleUpdateSlideTimes}
                speakerNotes={speakerNotes}
                onUpdateSpeakerNotes={handleUpdateSpeakerNotes}
                plannedTimes={plannedTimes}
                onUpdatePlannedTime={handleUpdatePlannedTime}
            />
            <UploadModal
                setIsOpen={setHasPresentationBeenChosenYet}
                isOpen={hasPresentationBeenChosenYet}
                uploadAndConvertPDF={async (file) => {
                    const newPresentationId = await uploadAndConvertPDF(file);
                    router.push(`/editor/${newPresentationId}`);
                }}
            />
        </div>
    );
}
