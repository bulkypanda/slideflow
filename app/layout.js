import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs'
import './globals.css'
import {Roboto} from "next/font/google";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"]
})

export default function RootLayout({
                                       children,
                                   }) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={roboto.className}>
            {children}
            </body>
            </html>
        </ClerkProvider>
    )
}
