"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { PresentationUi } from "@/components/presentation-ui";
import { UploadModal } from "@/components/upload-modal";
import {createPresentationSkeleton, uploadImages} from "@/lib/actions";

export default function Editor({ params }) {
    const { id } = params;
    const [hasPresentationBeenChosenYet, setHasPresentationBeenChosenYet] = useState(null);
    const [images, setImages] = useState([]);

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
        const {id: skeleton} = await createPresentationSkeleton({
            title: file.name,
        })
        const images = await convertPDFToJpeg(file);

        await uploadImages(skeleton, images)

        // setImages(images);
        setHasPresentationBeenChosenYet(false);
    }

    useEffect(() => {
        if (id === "new") {
            setHasPresentationBeenChosenYet(true);
        }
    }, []);

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
            {/* Display the converted images */}
            {images.map((image, index) => (
                <div key={index}>
                    <img src={image} alt={`Slide ${index + 1}`} />
                </div>
            ))}
            <UploadModal
                setIsOpen={setHasPresentationBeenChosenYet}
                isOpen={hasPresentationBeenChosenYet}
                uploadAndConvertPDF={uploadAndConvertPDF}
            />
            <PresentationUi images={images} />
        </div>
    );
}
