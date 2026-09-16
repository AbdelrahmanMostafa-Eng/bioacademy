'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const TEAL = '#206682'
const AMBER = '#FFA001'

function DNAHelix({ mounted }: { mounted: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const { strandA, strandB, rungs } = useMemo(() => {
    const turns = 3
    const pointsPerTurn = 24
    const total = turns * pointsPerTurn
    const radius = 1.2
    const height = 6
    const ptsA: THREE.Vector3[] = []
    const ptsB: THREE.Vector3[] = []
    const rungList: { pos: THREE.Vector3; rot: THREE.Euler; len: number }[] = []

    for (let i = 0; i <= total; i++) {
      const t = (i / total) * turns * Math.PI * 2
      const y = (i / total) * height - height / 2
      const ax = Math.cos(t) * radius, az = Math.sin(t) * radius
      const bx = Math.cos(t + Math.PI) * radius, bz = Math.sin(t + Math.PI) * radius
      const a = new THREE.Vector3(ax, y, az)
      const b = new THREE.Vector3(bx, y, bz)
      ptsA.push(a); ptsB.push(b)
      if (i % 3 === 0) {
        const mid = a.clone().lerp(b, 0.5)
        const angle = Math.atan2(bx - ax, bz - az)
        rungList.push({ pos: mid, rot: new THREE.Euler(0, angle, Math.PI / 2), len: a.distanceTo(b) })
      }
    }
    return {
      strandA: new THREE.CatmullRomCurve3(ptsA),
      strandB: new THREE.CatmullRomCurve3(ptsB),
      rungs: rungList,
    }
  }, [])

  // grows in from nothing on mount rather than just appearing - the same
  // spring-like easing feel as the rest of the site's Motion animations
  useFrame(() => {
    if (!groupRef.current) return
    const target = mounted ? 1 : 0
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08)
  })

  return (
    <group ref={groupRef} scale={0}>
      <mesh>
        <tubeGeometry args={[strandA, 200, 0.08, 8, false]} />
        <meshStandardMaterial color={TEAL} roughness={0.3} metalness={0.15} emissive={TEAL} emissiveIntensity={0.08} />
      </mesh>
      <mesh>
        <tubeGeometry args={[strandB, 200, 0.08, 8, false]} />
        <meshStandardMaterial color={AMBER} roughness={0.3} metalness={0.15} emissive={AMBER} emissiveIntensity={0.08} />
      </mesh>
      {rungs.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={r.rot}>
          <cylinderGeometry args={[0.03, 0.03, r.len, 6]} />
          <meshStandardMaterial color="#ffffff" opacity={0.55} transparent />
        </mesh>
      ))}
    </group>
  )
}

// a slow-drifting particle field behind the helix for depth - purely decorative,
// kept subtle (low opacity, tiny size) so it never competes with the helix itself
function Particles() {
  const positions = useMemo(() => {
    const arr = new Float32Array(240 * 3)
    for (let i = 0; i < 240; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])
  const ref = useRef<THREE.Points>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.02 })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={240} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.028} color={AMBER} transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

export default function Hero3D() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="w-full h-[420px] md:h-[520px]">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.1} color={AMBER} />
        <pointLight position={[-5, -5, -5]} intensity={0.7} color={TEAL} />
        <pointLight position={[0, 0, 8]} intensity={0.3} color="#ffffff" />
        <Particles />
        <DNAHelix mounted={mounted} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  )
}
