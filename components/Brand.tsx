import { ChefHat } from 'lucide-react'

export default function Brand({ light = false }: { light?: boolean }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}>
    <span className="brand-icon"><ChefHat size={23} strokeWidth={1.7} /></span>
    <span className="brand-type">RMS<span>A better kind of service.</span></span>
  </span>
}
