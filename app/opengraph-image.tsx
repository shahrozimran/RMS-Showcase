import { ImageResponse } from 'next/og'

export const alt = 'RMS — Great service. Starts here. Order, confirm, prepare, settle and understand.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#f4f7ee', padding: '56px 68px', color: '#173e31' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>RMS</div>
        <div style={{ display: 'flex', fontSize: 17, color: '#597452' }}>A better kind of service.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 62, fontSize: 86, fontWeight: 700, letterSpacing: -5, lineHeight: 1.05 }}>
        <span>Great service.</span><span style={{ color: '#819b6d' }}>Starts here.</span>
      </div>
      <div style={{ display: 'flex', fontSize: 24, marginTop: 24, color: '#5b7057' }}>One order. Every step, connected.</div>
      <div style={{ display: 'flex', gap: 13, marginTop: 42 }}>
        {['01  Order', '02  Confirm', '03  Prepare', '04  Settle', '05  Understand'].map(label => <div key={label} style={{ display: 'flex', border: '1px solid #d3dfca', borderRadius: 10, padding: '14px 20px', background: '#e8efdf', fontSize: 19 }}>{label}</div>)}
      </div>
    </div>, size,
  )
}
