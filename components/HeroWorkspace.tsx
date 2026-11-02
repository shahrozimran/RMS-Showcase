'use client'

import { useState } from 'react'
import { ArrowUpRight, BarChart3, Check, ChefHat, ChevronDown, ClipboardList, LayoutDashboard, Monitor, Plus, Search, Settings2, TableProperties, Users, UtensilsCrossed } from 'lucide-react'
import { demoMenu, initialCart, money, orderTotals } from '@/lib/demo'
import DishArt from './DishArt'

const views = ['Point of sale', 'Tables', 'Overview'] as const

export default function HeroWorkspace() {
  const [view, setView] = useState<(typeof views)[number]>('Point of sale')
  const order = orderTotals(initialCart)
  return <div className="hero-product">
    <div className="hero-workspace" aria-label="Interactive RMS product preview with sample data">
      <div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span><span className="mini-lock" />rms / your restaurant</span><span className="window-demo">Product preview</span></div>
      <div className="workspace-body">
        <aside className="mini-sidebar" aria-hidden="true">
          <div className="mini-brand"><ChefHat size={19} /><strong>RMS</strong></div>
          <div className="mini-location">Your restaurant<ChevronDown size={11} /><small>A little more in sync.</small></div>
          <span className="mini-nav-label">WORKSPACE</span>
          {[{name:'Overview',Icon:LayoutDashboard},{name:'Point of sale',Icon:Monitor},{name:'Orders',Icon:ClipboardList},{name:'Menu',Icon:UtensilsCrossed},{name:'Tables',Icon:TableProperties},{name:'Team',Icon:Users},{name:'Reports',Icon:BarChart3}].map(item=><div key={item.name} className={`mini-nav ${view===item.name?'selected':''}`}><item.Icon size={13}/><span>{item.name}</span></div>)}
          <div className="mini-sidebar-bottom"><Settings2 size={12}/><span>Every detail, in order.</span></div>
        </aside>
        <div className="mini-main">
          <div className="mini-topbar"><span>Workspace <span>/</span> {view}</span><span className="mini-avatar">AM</span></div>
          <div className="mini-heading"><div><span className="mini-eyebrow">A GOOD DAY TO SERVE</span><h3>{view==='Point of sale'?'Something delicious, coming up.':view==='Tables'?'A place for every guest.':'Your day, at a glance.'}</h3></div><span className="mini-data-label">Demo data</span></div>
          <div className="mini-scene" key={view}>
            {view==='Point of sale'?<div className="mini-pos"><div><div className="mini-search"><Search size={11}/>Find something delicious…</div><div className="mini-categories"><b>All items</b><span>Mains</span><span>Drinks</span></div><div className="mini-food-grid">{demoMenu.map(p=><div className="mini-food" key={p.id}><DishArt id={p.id}/><div><strong>{p.name}</strong><span>{money(p.price)}<i><Plus size={9}/></i></span></div></div>)}</div></div><div className="mini-receipt"><div className="row between"><strong>Current order</strong><span className="mini-table">T03</span></div><div className="mini-types"><b>Dine in</b><span>Takeaway</span></div>{order.lines.map(line=><div className="mini-order-line" key={line.id}><span><b>{line.quantity}×</b>{line.name}</span><strong>{money(line.amount)}</strong></div>)}<div className="mini-order-summary"><span>Subtotal<b>{money(order.subtotal)}</b></span><span>Tax<b>{money(order.tax)}</b></span><strong>Total<b>{money(order.total)}</b></strong></div><div className="mini-send"><Check size={11}/>Send to kitchen<ArrowUpRight size={11}/></div><small>Good food. Great service.</small></div></div>:view==='Tables'?<div className="mini-floor"><div className="mini-floor-legend"><span><i/>Available</span><span><i/>In service</span><span><i/>Reserved</span></div><div className="mini-tables">{Array.from({length:6},(_,i)=><div className={`mini-floor-card table-state-${i%3}`} key={i}><span className="mini-table-state">{['Available','In service','Reserved'][i%3]}</span><TableProperties size={29} strokeWidth={1.2}/><strong>Table {String(i+1).padStart(2,'0')}</strong><small>{i%2?4:2} seats</small></div>)}</div></div>:<div className="mini-overview"><div className="mini-metrics"><div><span>Sample sales</span><strong>$486.50</strong><small>Completed payments</small></div><div><span>Open orders</span><strong>04</strong><small>Currently in service</small></div><div><span>Team accounts</span><strong>08</strong><small>Your restaurant team</small></div></div><div className="mini-chart"><div className="row between"><strong>What your guests love</strong><span>This sample week</span></div><div className="mini-bars">{[40,64,52,78,69,95,72].map((v,i)=><div key={i}><i style={{height:`${v}%`}}/><span>{['M','T','W','T','F','S','S'][i]}</span></div>)}</div></div><div className="mini-overview-footer"><span><Check size={11}/>Orders, menu and team in one place</span><ArrowUpRight size={12}/></div></div>}
          </div>
        </div>
      </div>
    </div>
    <div className="hero-view-controls" aria-label="Preview screens">{views.map(v=><button key={v} aria-pressed={view===v} className={view===v?'active':''} onClick={()=>setView(v)}>{v==='Point of sale'?<Monitor size={13}/>:v==='Tables'?<TableProperties size={13}/>:<BarChart3 size={13}/>}<span>{v}</span></button>)}</div>
    <div className="hero-float-note"><span><Check size={15}/></span><div><strong>One order. Every detail connected.</strong><small>From the table to the final receipt.</small></div></div>
  </div>
}
