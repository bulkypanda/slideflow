"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PresentationUi } from "@/components/presentation-ui";
import { UploadModal } from "@/components/upload-modal";
import {createPresentationSkeleton, uploadImages} from "@/lib/actions";
import { supabase } from "@/lib/supabase";

export default function Editor({ params }) {
    const { id } = params;
    const [hasPresentationBeenChosenYet, setHasPresentationBeenChosenYet] = useState(null);
    const [images, setImages] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [slideTimes, setSlideTimes] = useState([]);

    const handleUpdateSlideTimes = (newSlideTimes) => {
        setSlideTimes(newSlideTimes);
    };

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
    }

    useEffect(() => {
        async function fetchSlides() {
            if (id !== "new") {
                const { data: slides, error } = await supabase
                    .from('slides')
                    .select('*')
                    .eq('presentation_id', id)
                    .order('slide_number', { ascending: true });

                if (error) {
                    console.error("Error fetching slides:", error);
                } else {
                    setImages(slides.map(slide => slide.image_url));
                }
            } else {
                setHasPresentationBeenChosenYet(true);
            }
        }

        fetchSlides();
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

    return (
        <div>
            <div className="flex items-center py-4 px-5 justify-between border-b border-black/30">
                <div className="flex gap-6 text-xl">
                    <Link href="/" className="text-2xl">
                        ⏰
                    </Link>
                    <h1 className="font-medium">Presentation Title</h1>
                </div>
                <div className="flex gap-6">
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
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
            />
            <UploadModal
                setIsOpen={setHasPresentationBeenChosenYet}
                isOpen={hasPresentationBeenChosenYet}
                uploadAndConvertPDF={uploadAndConvertPDF}
            />
        </div>
    );
}
