import { Citrus, Salad, Sandwich } from 'lucide-react'

export default function DishArt({ id, small = false }: { id: string; small?: boolean }) {
  const Icon = id === 'lemonade' ? Citrus : id === 'salad' ? Salad : Sandwich
  return <span aria-hidden="true" className={`dish-art dish-${id} ${small ? 'dish-small' : ''}`}>
    <span className="dish-plate"><Icon size={small ? 22 : 38} strokeWidth={1.3} /></span>
    {!small && <><i className="dish-speck one" /><i className="dish-speck two" /></>}
  </span>
}
