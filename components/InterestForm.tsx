'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, CheckCircle2, LoaderCircle, Mail, RotateCcw } from 'lucide-react'
import { interestOptions } from '@/lib/form-options'

export default function InterestForm() {
  const [selected, setSelected] = useState<string[]>(['A complete walkthrough'])
  const [busy, setBusy] = useState(false)
  const [slow, setSlow] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<{name:string;email:string}|null>(null)
  const form = useRef<HTMLFormElement>(null)
  const startedAt = useRef(0)
  useEffect(()=>{startedAt.current=Date.now()},[])
  useEffect(()=>{
    if(!busy)return
    const timer=setTimeout(()=>setSlow(true),4000)
    return ()=>clearTimeout(timer)
  },[busy])

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if(!selected.length){setError('Choose at least one thing you’d like to explore.');return}
    const data = new FormData(event.currentTarget)
    const text = (key:string) => String(data.get(key)||'').trim()
    const payload = {name:text('name'),email:text('email'),restaurant:text('restaurant'),phone:text('phone'),type:text('type'),locations:text('locations'),message:text('message'),consent:data.get('consent')==='on',website:text('website'),startedAt:startedAt.current,interests:selected}
    setSlow(false)
    setBusy(true)
    try {
      const response=await fetch('/api/interest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)})
      const result=await response.json()
      if(!response.ok||result.ok!==true)throw new Error(result.error||'We couldn’t send your enquiry. Please try again.')
      setSent({name:payload.name.split(' ')[0],email:payload.email})
    }catch(e){setError(e instanceof Error?e.message:'We couldn’t send your enquiry. Please try again.')}finally{setBusy(false)}
  }

  if(sent)return <div className="interest-success" role="status"><span className="success-symbol"><CheckCircle2 size={35}/></span><span className="eyebrow">A GOOD CONVERSATION STARTS HERE</span><h3>Thanks, {sent.name}.</h3><p>Your enquiry has been sent to the RMS team. We’ll use <strong>{sent.email}</strong> to get back to you about your restaurant.</p><a className="button button-dark" href="#demo">Keep exploring<ArrowRight size={15}/></a><button className="text-button" onClick={()=>{setSent(null);setSelected(['A complete walkthrough']);startedAt.current=Date.now()}}><RotateCcw size={13}/>Send another enquiry</button></div>

  return <form ref={form} onSubmit={submit} className="interest-form" aria-busy={busy}>
    <div className="form-heading"><span className="soft-badge"><span/>LET’S MAKE SERVICE SIMPLER</span><h3>A little about your restaurant.</h3><p>A few details. A more useful conversation.</p></div>
    <fieldset disabled={busy}>
      <div className="form-two-columns"><label className="field"><span>Your name <i>*</i></span><input name="name" placeholder="e.g. Alex Morgan" autoComplete="name" required minLength={2} maxLength={80}/></label><label className="field"><span>Email address <i>*</i></span><input name="email" type="email" placeholder="you@restaurant.com" autoComplete="email" required maxLength={254}/></label></div>
      <div className="form-two-columns"><label className="field"><span>Restaurant / business name <i>*</i></span><input name="restaurant" placeholder="The place you’re proud of" autoComplete="organization" required minLength={2} maxLength={100}/></label><label className="field"><span>Phone number <small>Optional</small></span><input name="phone" type="tel" placeholder="Include your country code" autoComplete="tel" maxLength={30}/></label></div>
      <div className="form-two-columns"><label className="field"><span>What kind of place?</span><select name="type" defaultValue="Restaurant"><option>Restaurant</option><option>Café</option><option>Takeaway</option><option>Cloud kitchen</option><option>Other</option></select></label><label className="field"><span>Your setup</span><select name="locations" defaultValue="One location"><option>One location</option><option>2–5 locations</option><option>6+ locations</option><option>Planning my first location</option></select></label></div>
      <div className="field"><span id="interests-label">What would you like to explore?</span><div className="interest-options" role="group" aria-labelledby="interests-label">{interestOptions.map(option=><label className={`interest-option ${selected.includes(option)?'selected':''}`} key={option}><input type="checkbox" checked={selected.includes(option)} onChange={()=>setSelected(old=>old.includes(option)?old.filter(v=>v!==option):[...old,option])}/>{selected.includes(option)&&<Check size={12}/>}<span>{option}</span></label>)}</div></div>
      <label className="field"><span>Anything you’d like us to know? <small>Optional</small></span><textarea name="message" placeholder="Tell us what gets tricky during a busy service…" maxLength={1200} rows={3}/></label>
      <div className="form-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <label className="consent-field"><input type="checkbox" name="consent" required/><span>You can contact me about RMS using the details I’ve shared. <a href="/privacy">How we use your details</a></span></label>
      {error&&<div className="form-error" role="alert"><Mail size={17}/><span>{error}</span></div>}
      <button className="button button-dark form-submit" type="submit" disabled={busy}>{busy?<LoaderCircle size={17} className="spin"/>:<Mail size={16}/>}<span>{busy?'Sending your enquiry…':'Get my personal walkthrough'}</span><ArrowRight size={17}/></button>
      <p className="form-footnote" role="status">{busy&&slow?'Your enquiry is still sending. Please keep this page open.':'Your enquiry goes straight to our inbox. A real conversation, at your pace.'}</p>
    </fieldset>
  </form>
}
