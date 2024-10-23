import React from "react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
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
  );
}
