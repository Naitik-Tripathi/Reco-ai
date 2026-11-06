import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, Wind } from 'lucide-react'
import * as THREE from 'three'

const PARTS = ['Fan', 'Air Filter', 'Battery', 'Grill']
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const ease = v => { const t = clamp(v); return t * t * (3 - 2 * t) }

function roundedRect(x, y, w, h, r) {
  const s = new THREE.Shape()
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s
}
function extrude(shape, material, depth, bevel = 0.025) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSegments: 3, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 18 })
  g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return new THREE.Mesh(g, material)
}
function logoTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 180
  const x = c.getContext('2d'); x.clearRect(0, 0, 512, 180); x.fillStyle = '#eaf6fb'
  x.font = '800 112px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RECO', 256, 88)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

function buildHelmet() {
  const root = new THREE.Group()
  const shellMat = new THREE.MeshPhysicalMaterial({ color: 0x14191f, metalness: 0.42, roughness: 0.29, clearcoat: 1, clearcoatRoughness: 0.2 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x080c11, metalness: 0.62, roughness: 0.31 })
  const panel = new THREE.MeshStandardMaterial({ color: 0x202a32, metalness: 0.48, roughness: 0.4 })
  const steel = new THREE.MeshStandardMaterial({ color: 0x82919b, metalness: 0.88, roughness: 0.28 })
  const visorMat = new THREE.MeshPhysicalMaterial({ color: 0x07131b, metalness: 0.72, roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
  const cyan = new THREE.MeshStandardMaterial({ color: 0x3d9bb4, metalness: 0.58, roughness: 0.3, emissive: 0x0b2a35, emissiveIntensity: 0.55 })

  // An angular side silhouette, with a pronounced peak and forward chin.
  const silhouette = new THREE.Shape()
  silhouette.moveTo(-1.28, -0.47)
  silhouette.quadraticCurveTo(-1.57, -0.20, -1.48, 0.20)
  silhouette.quadraticCurveTo(-1.43, 0.72, -0.98, 1.06)
  silhouette.quadraticCurveTo(-0.47, 1.39, 0.22, 1.29)
  silhouette.quadraticCurveTo(0.67, 1.22, 1.05, 0.88)
  silhouette.lineTo(1.78, 0.76); silhouette.lineTo(1.91, 0.67); silhouette.lineTo(1.34, 0.55)
  silhouette.quadraticCurveTo(1.28, 0.47, 1.31, 0.29); silhouette.lineTo(1.50, -0.12); silhouette.lineTo(1.33, -0.49)
  silhouette.quadraticCurveTo(1.10, -0.96, 0.52, -1.10)
  silhouette.quadraticCurveTo(-0.35, -1.22, -0.97, -0.85)
  silhouette.quadraticCurveTo(-1.29, -0.67, -1.28, -0.47); silhouette.closePath()
  root.add(extrude(silhouette, shellMat, 1.48, 0.075))

  const peak = new THREE.Shape(); peak.moveTo(0.05, 1.12); peak.lineTo(1.91, 0.69); peak.lineTo(1.42, 0.55); peak.lineTo(0.66, 0.80); peak.closePath()
  root.add(extrude(peak, dark, 1.58, 0.025))
  const chin = new THREE.Shape(); chin.moveTo(0.37, -0.20); chin.lineTo(1.48, -0.12); chin.lineTo(1.29, -0.55)
  chin.quadraticCurveTo(1.10, -0.98, 0.53, -1.06); chin.lineTo(0.24, -0.77); chin.closePath()
  const chinMesh = extrude(chin, panel, 0.035, 0.012); chinMesh.position.z = 0.85; root.add(chinMesh)

  const visor = new THREE.Shape(); visor.moveTo(-0.58, 0.56); visor.quadraticCurveTo(-0.22, 0.91, 0.29, 0.72)
  visor.lineTo(1.12, 0.40); visor.quadraticCurveTo(1.25, 0.34, 1.14, 0.25); visor.lineTo(0.29, 0.17)
  visor.quadraticCurveTo(-0.20, 0.14, -0.60, 0.37); visor.closePath()
  const visorMesh = extrude(visor, visorMat, 0.024, 0.006); visorMesh.position.z = 0.85; root.add(visorMesh)

  const visorEdge = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.035, 0.045), steel)
  visorEdge.position.set(0.27, 0.15, 0.89); visorEdge.rotation.z = -0.045; root.add(visorEdge)
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.075, 40), steel)
  hinge.rotation.x = Math.PI / 2; hinge.position.set(0.55, 0.20, 0.90); root.add(hinge)
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.085, 40), dark)
  cap.rotation.x = Math.PI / 2; cap.position.set(0.55, 0.20, 0.96); root.add(cap)

  const chamber = extrude(roundedRect(-1.48, -0.40, 0.56, 0.62, 0.09), dark, 0.13, 0.018)
  chamber.position.z = 0.83; root.add(chamber)
  const inset = extrude(roundedRect(-1.41, -0.33, 0.42, 0.48, 0.055), panel, 0.035, 0.006)
  inset.position.z = 0.92; root.add(inset)
  for (let i = 0; i < 3; i += 1) {
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.025, 0.022), dark)
    slit.position.set(-1.20, 0.18 - i * 0.075, 0.95); slit.rotation.z = -0.12; root.add(slit)
  }
  const sidePanel = extrude(roundedRect(-0.67, -0.19, 0.86, 0.38, 0.08), dark, 0.025, 0.008)
  sidePanel.position.z = 0.85; root.add(sidePanel)
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.23), new THREE.MeshBasicMaterial({ map: logoTexture(), transparent: true, depthWrite: false }))
  logo.position.set(-0.23, -0.005, 0.89); root.add(logo)
  for (let i = 0; i < 4; i += 1) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.035, 0.035), dark)
    vent.position.set(-0.22 + i * 0.18, 1.18 - i * 0.035, 0.84); vent.rotation.z = -0.12; root.add(vent)
  }
  for (const y of [-0.46, -0.58]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.028, 24), steel)
    bolt.rotation.x = Math.PI / 2; bolt.position.set(0.98, y, 0.86); root.add(bolt)
  }
  const rearAccent = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.44, 0.035), cyan)
  rearAccent.position.set(-1.52, -0.12, 0.94); root.add(rearAccent)

  const parts = []
  const base = new THREE.Vector3(-1.27, -0.12, 1.12)
  const metal = new THREE.MeshStandardMaterial({ color: 0x82949d, metalness: 0.75, roughness: 0.33 })
  const componentDark = new THREE.MeshStandardMaterial({ color: 0x151e26, metalness: 0.55, roughness: 0.38 })
  const filterMat = new THREE.MeshStandardMaterial({ color: 0x9aa6ab, metalness: 0.28, roughness: 0.83 })

  // Fan.
  const fan = new THREE.Group()
  fan.add(new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.045, 12, 48), metal))
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 32), componentDark); hub.rotation.x = Math.PI / 2; fan.add(hub)
  for (let i = 0; i < 7; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.235, 0.035), metal)
    const a = i * Math.PI * 2 / 7; blade.position.set(Math.cos(a) * 0.145, Math.sin(a) * 0.145, 0.005); blade.rotation.z = a + 0.45; fan.add(blade)
  }
  parts.push(fan)

  // Air filter.
  const filter = new THREE.Group()
  filter.add(new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.53, 0.16), componentDark))
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.47, 0.035), filterMat); face.position.z = 0.10; filter.add(face)
  for (let i = 0; i < 10; i += 1) {
    const pleat = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.43, 0.018), metal)
    pleat.position.set(-0.27 + i * 0.06, 0, 0.125); filter.add(pleat)
  }
  parts.push(filter)

  // Battery.
  const battery = new THREE.Group()
  battery.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.39, 0.23), componentDark))
  const batteryTop = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.055, 0.18), metal); batteryTop.position.y = 0.225; battery.add(batteryTop)
  for (const x of [-0.18, 0.18]) {
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.09), steel)
    terminal.position.set(x, 0.28, 0); battery.add(terminal)
  }
  parts.push(battery)

  // Perforated steel-style grille.
  const grill = new THREE.Group()
  grill.add(new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.59, 0.075), componentDark))
  const grillFace = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.50, 0.025), metal); grillFace.position.z = 0.055; grill.add(grillFace)
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x101a20 })
  for (let row = 0; row < 4; row += 1) for (let col = 0; col < 6; col += 1) {
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), holeMat)
    hole.position.set(-0.27 + col * 0.108, -0.18 + row * 0.12, 0.073); grill.add(hole)
  }
  parts.push(grill)

  const bases = []
  parts.forEach(part => { part.position.copy(base); part.visible = false; root.add(part); bases.push(base.clone()) })
  return { root, parts, bases }
}

export default function YourReco() {
  const mountRef = useRef(null)
  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const progressRef = useRef(0)
  const activeRef = useRef(-1)
  const [activePart, setActivePart] = useState(-1)

  useEffect(() => {
    const mount = mountRef.current, track = trackRef.current, stage = stageRef.current
    if (!mount || !track || !stage) return undefined
    window.scrollTo(0, 0)
    let alive = true, frame = 0, scrollFrame = 0
    const scene = new THREE.Scene()
    scene.background = null
    scene.fog = new THREE.Fog(0x050505, 11, 23)
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
    camera.position.set(0, 0.18, 8.2)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8))
    renderer.setClearColor(0x050505, 0); renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xa9d4e8, 0x111722, 1.55))
    const key = new THREE.DirectionalLight(0xf0f7ff, 3.1); key.position.set(3.5, 5.2, 6); scene.add(key)
    const rim = new THREE.DirectionalLight(0xd8dde2, 3.6); rim.position.set(-4.5, 2.3, -4); scene.add(rim)
    const fill = new THREE.PointLight(0x9da5ad, 23, 13); fill.position.set(-2.8, -0.6, 4.5); scene.add(fill)
    const top = new THREE.PointLight(0xd5d9de, 16, 10); top.position.set(1.2, 4, -1.5); scene.add(top)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 80), new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.22, roughness: 0.54 }))
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.62; scene.add(floor)
    
    const { root, parts, bases } = buildHelmet(); root.position.set(0, -0.04, 0); scene.add(root)
    const resize = () => {
      if (!alive) return
      const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight)
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false)
    }
    const readScroll = () => {
      if (!alive) return
      const distance = Math.max(1, track.offsetHeight - window.innerHeight)
      const progress = clamp(Math.max(0, -track.getBoundingClientRect().top) / distance)
      progressRef.current = progress
      const next = progress < 0.45 ? -1 : Math.min(3, Math.floor((progress - 0.45) / 0.11))
      if (next !== activeRef.current) { activeRef.current = next; setActivePart(next) }
      if (scrollFrame) cancelAnimationFrame(scrollFrame)
      scrollFrame = requestAnimationFrame(() => { stage.style.setProperty('--yr-stage-fade', String(progress > 0.945 ? 1 - (progress - 0.945) / 0.055 : 1)); stage.style.setProperty('--yr-progress', `${progress * 100}%`) })
    }
    resize(); readScroll()
    window.addEventListener('resize', resize); window.addEventListener('scroll', readScroll, { passive: true })

    const animate = () => {
      if (!alive) return
      frame = requestAnimationFrame(animate)
      const p = progressRef.current
      const turn = ease(p / 0.37)
      root.rotation.y = Math.PI * 2 * turn
      root.rotation.x = 0.015 + ease((p - 0.37) / 0.12) * 0.018
      root.position.y = -0.04 + Math.sin(turn * Math.PI * 2) * 0.018
      const reveal = ease((p - 0.43) / 0.47)
      const narrow = camera.aspect < 0.82
      camera.position.z = (narrow ? 9.7 : 7.9) + ((narrow ? 14.7 : 10.9) - (narrow ? 9.7 : 7.9)) * reveal
      const targetX = (narrow ? -0.65 : -1.05) * reveal
      camera.position.x += (targetX - camera.position.x) * 0.075
      camera.position.y += (0.18 - camera.position.y) * 0.075
      camera.lookAt(targetX, -0.02, 0)
      parts.forEach((part, i) => {
        const start = 0.45 + i * 0.11
        const t = ease((p - start) / 0.105)
        part.visible = p >= start
        if (!part.visible) return
        const offsets = narrow ? [0.54, 1.12, 1.70, 2.28] : [0.72, 1.48, 2.24, 3.00]
        const rise = [0.02, 0.10, -0.07, 0.06][i]
        part.position.set(bases[i].x - offsets[i] * t, bases[i].y + rise * t, bases[i].z + 0.36 * t)
        part.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.025 * t
        part.scale.setScalar(0.88 + 0.12 * t)
      })
      const fade = p > 0.945 ? 1 - (p - 0.945) / 0.055 : 1
      renderer.domElement.style.opacity = String(clamp(fade))
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      alive = false; cancelAnimationFrame(frame); if (scrollFrame) cancelAnimationFrame(scrollFrame)
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', readScroll)
      root.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose() })
      })
      floor.geometry.dispose(); floor.material.dispose(); renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="your-reco-page">
    <div className="your-reco-track" ref={trackRef}>
      <section className="your-reco-stage" ref={stageRef} aria-label="RECO 3D helmet scroll experience">
        <div className="your-reco-canvas" ref={mountRef}/><div className="your-reco-grain"/>
        <div className="your-reco-topline"><div className="your-reco-mark"><Wind size={15}/><span>RECO / YOUR RECO</span></div><span className="your-reco-topnote">SMART HELMET · CONCEPT MODEL</span></div>
        <div className="your-reco-headline"><div className="your-reco-kicker">ENGINEERED AROUND THE RIDE</div><h1>Meet your<br/><span>RECO helmet.</span></h1></div>
        <div className={`your-reco-part-label ${activePart >= 0 ? 'visible' : ''}`} aria-live="polite"><span>COMPONENT {activePart >= 0 ? `0${activePart + 1} / 04` : 'REVEAL'}</span><strong>{activePart >= 0 ? PARTS[activePart] : '360° VIEW'}</strong></div>
        <div className="your-reco-scroll-cue"><span>{activePart < 0 ? 'SCROLL TO ROTATE' : activePart < 3 ? 'SCROLL TO UNPACK' : 'KEEP SCROLLING'}</span><ArrowDown size={14}/></div>
        <div className="your-reco-progress"><span/></div>
        <div className="your-reco-stage-foot"><span>RECO SMART AIR SYSTEM</span><span>SCROLL-DRIVEN PRODUCT VIEW</span></div>
      </section>
    </div>
    <section className="your-reco-outro"><div className="your-reco-outro-inner"><div className="your-reco-kicker">THE RECO ECOSYSTEM</div><h2>Technology made<br/><span>for the journey.</span></h2><p>Explore the wider RECO AI platform, prototype updates and the technology behind the concept.</p><div className="your-reco-outro-links"><Link to="/technology" className="button button-primary">Explore technology <ArrowUpRight size={15}/></Link><Link to="/my-reco" className="button button-ghost">Device monitor <ArrowUpRight size={15}/></Link><Link to="/" className="your-reco-back-link">Back to RECO AI home</Link></div></div><div className="your-reco-outro-mark">RECO<span>AI</span></div></section>
  </div>
}
