import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Wind, Gauge, Thermometer, Cloud, RefreshCw, MapPin, ArrowUpRight, Activity } from 'lucide-react'
import { api, aqiLabel } from '../lib/api'
import { PageHeader, StatCard, Panel, Loading, ErrorState, Notice } from '../components'

const DELHI = { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 }
function timeLabel(value) { if (!value) return ''; const parts = value.split('T'); return parts[1]?.slice(0,5) || value }
export default function Dashboard() {
  const [data,setData] = useState(null), [loading,setLoading] = useState(true), [error,setError] = useState('')
  const load = async () => { setLoading(true); setError(''); try { setData(await api.airQuality(DELHI.lat, DELHI.lon)) } catch(e) { setError(e.message) } finally { setLoading(false) } }
  useEffect(()=>{load()},[])
  const current = data?.current || {}, status = aqiLabel(current.us_aqi)
  const chart = (data?.hourly || []).slice(0,18).map(row=>({...row,label:timeLabel(row.time)}))
  return <div><PageHeader eyebrow="OVERVIEW / LIVE ENVIRONMENT" title="Air quality dashboard" description="Available modelled air-quality data for your selected location." actions={<button className="button button-secondary" onClick={load}><RefreshCw size={15}/> Refresh data</button>}/>
    <div className="location-strip"><div className="location-bullet"><MapPin size={16}/></div><div><strong>{DELHI.name}</strong><span>Default location · Open-Meteo model grid data</span></div><span className="location-tag">LOCATION ACTIVE</span></div>
    {loading ? <Loading label="Fetching current air-quality data..."/> : error ? <ErrorState message={error} onRetry={load}/> : <>
      <Notice tone="info">These are modelled environmental values for a nearby grid cell, not readings from the RECO helmet or a personal health measurement.</Notice>
      <div className="stats-grid stats-grid-four">
        <StatCard label="US Air Quality Index" value={current.us_aqi ?? '—'} unit="AQI" icon={Gauge} tone="cyan" footnote={status.label}/>
        <StatCard label="PM2.5 concentration" value={current.pm2_5 ?? '—'} unit="µg/m³" icon={Wind} tone="violet" footnote="Fine particulate matter"/>
        <StatCard label="PM10 concentration" value={current.pm10 ?? '—'} unit="µg/m³" icon={Cloud} tone="blue" footnote="Coarse particulate matter"/>
        <StatCard label="European AQI" value={current.european_aqi ?? '—'} unit="AQI" icon={Activity} tone="green" footnote="European index"/>
      </div>
      <div className="dashboard-grid"><Panel title="Air-quality outlook" subtitle="Hourly forecast · next available hours" action={<span className="chart-legend"><i/> US AQI</span>}><div className="chart-wrap">{chart.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3bc9ef" stopOpacity={0.3}/><stop offset="95%" stopColor="#3bc9ef" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#1b2a3d" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="label" stroke="#66768c" tick={{fontSize:11}} tickLine={false} axisLine={false}/><YAxis stroke="#66768c" tick={{fontSize:11}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'#101b2b',border:'1px solid #24364c',borderRadius:12,color:'#e7f1fc'}}/><Area type="monotone" dataKey="us_aqi" name="US AQI" stroke="#42c9ee" strokeWidth={2.5} fill="url(#aqiFill)" connectNulls/></AreaChart></ResponsiveContainer> : <div className="empty-chart">Hourly data is not available right now.</div>}</div></Panel>
      <Panel title="Pollutant snapshot" subtitle="Current values supplied by the data provider"><div className="pollutant-list">{[{name:'PM2.5',v:current.pm2_5,u:'µg/m³',desc:'Fine particles'},{name:'PM10',v:current.pm10,u:'µg/m³',desc:'Coarse particles'},{name:'Nitrogen dioxide',v:current.nitrogen_dioxide,u:'µg/m³',desc:'NO₂'},{name:'Ozone',v:current.ozone,u:'µg/m³',desc:'O₃'},{name:'Carbon monoxide',v:current.carbon_monoxide,u:'µg/m³',desc:'CO'}].map(x=><div className="pollutant-row" key={x.name}><div><strong>{x.name}</strong><span>{x.desc}</span></div><b>{x.v ?? '—'} <small>{x.u}</small></b></div>)}</div></Panel></div>
      <div className="data-source-line"><span>Source: {data.source}</span><span>Provider time: {current.time || 'Not supplied'}</span></div>
    </>}
  </div>
}
