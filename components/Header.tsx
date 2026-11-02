'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Brand from './Brand'

export default function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])
  return <header className="site-header">
    <div className="container header-inner">
      <a href="#top" aria-label="RMS showcase home"><Brand /></a>
      <nav id="main-navigation" className={open ? 'main-navigation open' : 'main-navigation'} aria-label="Main navigation">
        <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
        <a href="#demo" onClick={() => setOpen(false)}>Try the demo</a>
        <a href="#features" onClick={() => setOpen(false)}>What’s inside</a>
        <a href="#questions" onClick={() => setOpen(false)}>Questions</a>
        <a className="mobile-nav-cta" href="#interest" onClick={() => setOpen(false)}>Get a walkthrough <ArrowUpRight size={14} /></a>
      </nav>
      <a className="button button-dark header-cta" href="#interest">Let’s talk <ArrowUpRight size={15} /></a>
      <button className="mobile-menu-button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </header>
}
