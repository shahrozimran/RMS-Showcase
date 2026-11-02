import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata:Metadata={
  metadataBase:new URL(process.env.SITE_URL||'http://localhost:3002'),
  title:{default:'RMS — A better kind of service.',template:'%s | RMS'},
  description:'Discover a simpler way to run your restaurant. Try the RMS workflow—from guest QR ordering and POS to kitchen tickets, billing and the owner’s overview.',
  openGraph:{title:'RMS — Great service starts here.',description:'One order. Every step, connected. Explore the interactive restaurant management showcase.',type:'website',siteName:'RMS Showcase'},
  twitter:{card:'summary_large_image',title:'RMS — Great service starts here.',description:'Try a restaurant workflow that brings your people, menu and service together.'},
}
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#173e31'}

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Manrope:wght@400;500;600;650;700;750;800&display=swap" rel="stylesheet"/></head><body><a href="#main" className="skip-link">Skip to content</a>{children}</body></html>
}
