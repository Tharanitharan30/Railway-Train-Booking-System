import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export default function ThreeDChatButton({ active = false, size = 48 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(size, size, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.pointerEvents = 'none'
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: active ? 0xe0f2fe : 0xf8fafc,
      metalness: 0.62,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transmission: 0.08,
      thickness: 0.9,
      emissive: new THREE.Color(active ? 0x0f172a : 0x1e293b),
      emissiveIntensity: active ? 0.18 : 0.08,
    })

    const blueMaterial = new THREE.MeshStandardMaterial({
      color: active ? 0x60a5fa : 0x3b82f6,
      emissive: active ? 0x38bdf8 : 0x1d4ed8,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.22,
    })

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x0f172a,
      emissiveIntensity: 0.08,
      metalness: 0.3,
      roughness: 0.5,
    })

    const glowMaterial = new THREE.MeshStandardMaterial({
      color: active ? 0x93c5fd : 0xbfdbfe,
      emissive: active ? 0x7dd3fc : 0x60a5fa,
      emissiveIntensity: 0.7,
      metalness: 0.4,
      roughness: 0.2,
    })

    const head = new THREE.Mesh(new RoundedBoxGeometry(2.4, 1.9, 1.55, 7, 0.18), shellMaterial)
    head.position.y = 0.24
    head.rotation.z = -0.05
    group.add(head)

    const headPanel = new THREE.Mesh(new RoundedBoxGeometry(1.82, 1.36, 1.18, 7, 0.13), new THREE.MeshStandardMaterial({
      color: active ? 0xdbeafe : 0xe0f2fe,
      metalness: 0.48,
      roughness: 0.14,
      emissive: active ? 0x0f172a : 0x1e3a8a,
      emissiveIntensity: 0.06,
    }))
    headPanel.position.set(0, 0.17, 0.12)
    group.add(headPanel)

    const body = new THREE.Mesh(new RoundedBoxGeometry(1.68, 1.2, 1.3, 6, 0.16), blueMaterial)
    body.position.set(0, -1.28, 0.06)
    body.rotation.z = 0.03
    group.add(body)

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.38, 20), blueMaterial)
    neck.position.set(0, -0.78, 0.02)
    group.add(neck)

    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 16), glowMaterial)
    antennaStem.position.set(0.42, 1.62, 0.12)
    antennaStem.rotation.z = -0.1
    group.add(antennaStem)

    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), glowMaterial)
    antennaTip.position.set(0.5, 1.94, 0.14)
    group.add(antennaTip)

    const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), darkMaterial)
    eyeLeft.position.set(-0.52, 0.44, 0.82)
    group.add(eyeLeft)

    const eyeRight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), darkMaterial)
    eyeRight.position.set(0.52, 0.44, 0.82)
    group.add(eyeRight)

    const eyeGlowLeft = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), glowMaterial)
    eyeGlowLeft.position.set(-0.45, 0.5, 0.94)
    group.add(eyeGlowLeft)

    const eyeGlowRight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), glowMaterial)
    eyeGlowRight.position.set(0.45, 0.5, 0.94)
    group.add(eyeGlowRight)

    const mouth = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.16, 0.16, 5, 0.05), darkMaterial)
    mouth.position.set(0, -0.05, 0.92)
    group.add(mouth)

    const cheekLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), glowMaterial)
    cheekLeft.rotation.z = Math.PI / 2
    cheekLeft.position.set(-0.95, 0.0, 0.58)
    group.add(cheekLeft)

    const cheekRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), glowMaterial)
    cheekRight.rotation.z = Math.PI / 2
    cheekRight.position.set(0.95, 0.0, 0.58)
    group.add(cheekRight)

    const accentBar = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.12, 0.14, 4, 0.04), glowMaterial)
    accentBar.position.set(0, -1.42, 0.7)
    group.add(accentBar)

    const ambient = new THREE.AmbientLight(0xffffff, 1.9)
    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(3.2, 4.4, 6)
    const fill = new THREE.PointLight(active ? 0x60a5fa : 0x3b82f6, 18, 22)
    fill.position.set(-2.2, -0.8, 5)
    scene.add(ambient, key, fill)

    let frameId = 0
    let hover = 0
    let targetTiltX = 0
    let targetTiltY = 0

    const onPointerMove = (event) => {
      const bounds = mount.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
      targetTiltX = -y * 0.55
      targetTiltY = x * 0.7
    }

    const onPointerEnter = () => {
      hover = 1
    }

    const onPointerLeave = () => {
      hover = 0
      targetTiltX = 0
      targetTiltY = 0
    }

    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerenter', onPointerEnter)
    mount.addEventListener('pointerleave', onPointerLeave)

    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const breathing = 1 + Math.sin(elapsed * 2.1) * 0.03 + hover * 0.05

      group.rotation.x += (0.14 + targetTiltX - group.rotation.x) * 0.08
      group.rotation.y += (elapsed * 0.55 + targetTiltY - group.rotation.y) * 0.05
      group.rotation.z = Math.sin(elapsed * 0.55) * 0.07
      group.scale.setScalar(breathing)

      head.rotation.x = Math.sin(elapsed * 0.7) * 0.03
      body.rotation.x = Math.cos(elapsed * 0.5) * 0.025
      antennaStem.rotation.z = -0.1 + Math.sin(elapsed * 1.7) * 0.05
      antennaTip.position.y = 1.94 + Math.sin(elapsed * 2.2) * 0.05

      const blink = 1 - Math.max(0, Math.sin(elapsed * 2.8 + 1.5)) * 0.65
      eyeLeft.scale.y = blink
      eyeRight.scale.y = blink
      eyeGlowLeft.scale.y = blink
      eyeGlowRight.scale.y = blink
      mouth.scale.x = 1 + Math.sin(elapsed * 1.9) * 0.05
      fill.intensity = active ? 20 : 16

      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(frameId)
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerenter', onPointerEnter)
      mount.removeEventListener('pointerleave', onPointerLeave)
      renderer.dispose()
      head.geometry.dispose()
      headPanel.geometry.dispose()
      body.geometry.dispose()
      neck.geometry.dispose()
      antennaStem.geometry.dispose()
      antennaTip.geometry.dispose()
      eyeLeft.geometry.dispose()
      eyeRight.geometry.dispose()
      eyeGlowLeft.geometry.dispose()
      eyeGlowRight.geometry.dispose()
      mouth.geometry.dispose()
      cheekLeft.geometry.dispose()
      cheekRight.geometry.dispose()
      accentBar.geometry.dispose()
      shellMaterial.dispose()
      blueMaterial.dispose()
      darkMaterial.dispose()
      glowMaterial.dispose()
      renderer.domElement.remove()
    }
  }, [active, size])

  return <span ref={mountRef} style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true" />
}