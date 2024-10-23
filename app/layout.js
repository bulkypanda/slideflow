import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs'
import './globals.css'
import {Roboto} from "next/font/google";

import Link from "next/link";
import { Navigation } from "./navigation";
import { ThemeProvider } from "@/components/theme-provider";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"]
})

export const metadata = {
    title: 'SlideFlow',
    description: 'Master your presentations with ease and confidence',
}

export default function RootLayout({
    children,
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={roboto.className}>
                    <ThemeProvider>
                        <Navigation />
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
