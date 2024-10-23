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
                <nav className="bg-gray-800 text-white p-4 shadow-md">
                    <div className="container mx-auto flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold hover:text-blue-300 transition-colors">SlideFlow</Link>
                        <div className="flex items-center space-x-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/presentations" className="hover:text-blue-300 transition-colors">My Presentations</Link>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </nav>
                {children}
            </body>
            </html>
        </ClerkProvider>
    )
}
