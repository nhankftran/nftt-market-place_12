"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { client } from "@/app/client"
import { ConnectButton } from "thirdweb/react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold text-xl">NFT Collection</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Collection
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Roadmap
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Team
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ConnectButton client={client} />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden flex items-center justify-center" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link href="#" className="text-sm font-medium hover:text-primary">
                Collection
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary">
                Roadmap
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary">
                Team
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary">
                FAQ
              </Link>
            </nav>
            <div className="pt-2">
              <ConnectButton client={client} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

import { Sparkles } from "lucide-react"
