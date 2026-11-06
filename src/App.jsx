import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CleanRoutes from './pages/CleanRoutes'
import MyReco from './pages/MyReco'
import YourReco from './pages/YourReco'
import Assistant from './pages/Assistant'
import Community from './pages/Community'
import Analytics from './pages/Analytics'
import Environment from './pages/Environment'
import Technology from './pages/Technology'
import About from './pages/About'

export default function App() {
  return <AppLayout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
    <Route path="/routes" element={<CleanRoutes/>}/>
    <Route path="/my-reco" element={<MyReco/>}/>
    <Route path="/your-reco" element={<YourReco/>}/>
    <Route path="/assistant" element={<Assistant/>}/>
    <Route path="/community" element={<Community/>}/>
    <Route path="/analytics" element={<Analytics/>}/>
    <Route path="/environment" element={<Environment/>}/>
    <Route path="/technology" element={<Technology/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="*" element={<Home/>}/>
  </Routes></AppLayout>
}
