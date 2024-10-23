'use client';

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import NavbarHome from "@/components/navbar";


export function Navigation() {
  const currentPathname = usePathname();
  const homePagePathnames = [
    "/",
    "/presentations"
  ];
  const isHomePage = useMemo(() => homePagePathnames.includes(currentPathname), [currentPathname]);

  if (isHomePage) {
    return (
      <NavbarHome />
    );
  }
}