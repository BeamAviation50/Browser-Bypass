"use client"

import Link from "next/link"
import Image from "next/image"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="Lightning Airways Logo" width={40} height={40} className="rounded" />
          <span className="text-xl font-bold text-foreground">Lightning Airways</span>
        </Link>
      </nav>
    </header>
  )
}
