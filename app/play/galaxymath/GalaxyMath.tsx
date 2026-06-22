'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default function GalaxyMath() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x030310)

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    camera.position.set(0, 18, 0)
    camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0x8888ff, 1.2)
    sun.position.set(10, 20, 10)
    scene.add(sun)

    const starGeo = new THREE.BufferGeometry()
    const starVerts = []
    for (let i = 0; i < 2000; i++) {
      starVerts.push((Math.random() - 0.5) * 400)
      starVerts.push((Math.random() - 0.5) * 10 + 5)
      starVerts.push((Math.random() - 0.5) * 400)
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 }))
    scene.add(stars)

    const textureLoader = new THREE.TextureLoader()
    const tex = textureLoader.load('/kaykit/KayKit_Space_Base_Bits_1.0_FREE/Assets/gltf/spacebits_texture.png')

    const loader = new GLTFLoader()
    const models = ['rock_A', 'rock_B', 'rocks_A', 'lander_A', 'structure_low', 'containers_A']
    const basePath = '/kaykit/KayKit_Space_Base_Bits_1.0_FREE/Assets/gltf/'

    const positions = [
      [-8, 0, -6], [6, 0, -8], [-4, 0, 8], [10, 0, 4],
      [-10, 0, 2], [3, 0, -4]
    ]

    models.forEach((name, i) => {
      loader.load(`${basePath}${name}.gltf`, (gltf) => {
        const model = gltf.scene
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.material = new THREE.MeshLambertMaterial({ map: tex })
          }
        })
        const [x, y, z] = positions[i]
        model.position.set(x, y, z)
        model.scale.setScalar(1.2)
        scene.add(model)
      })
    })

    const shipGeo = new THREE.ConeGeometry(0.6, 1.4, 6)
    const shipMat = new THREE.MeshLambertMaterial({ color: 0x818cf8 })
    const ship = new THREE.Mesh(shipGeo, shipMat)
    ship.rotation.x = Math.PI / 2
    ship.position.set(0, 0.5, 0)
    scene.add(ship)

    const thrusterGeo = new THREE.SphereGeometry(0.3, 8, 8)
    const thrusterMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24 })
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat)
    thruster.position.set(0, 0.5, 0.9)
    scene.add(thruster)

    const keys: Record<string, boolean> = {}
    const onKey = (e: KeyboardEvent) => { keys[e.key] = e.type === 'keydown' }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)

    let animId: number
    const speed = 0.08
    const bounds = 14

    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (keys['ArrowLeft'] || keys['a']) { ship.position.x -= speed; thruster.position.x -= speed }
      if (keys['ArrowRight'] || keys['d']) { ship.position.x += speed; thruster.position.x += speed }
      if (keys['ArrowUp'] || keys['w']) { ship.position.z -= speed; thruster.position.z -= speed }
      if (keys['ArrowDown'] || keys['s']) { ship.position.z += speed; thruster.position.z += speed }

      ship.position.x = Math.max(-bounds, Math.min(bounds, ship.position.x))
      ship.position.z = Math.max(-bounds, Math.min(bounds, ship.position.z))
      thruster.position.x = ship.position.x
      thruster.position.z = ship.position.z + 0.9

      camera.position.x = ship.position.x
      camera.position.z = ship.position.z + 1
      camera.lookAt(ship.position.x, 0, ship.position.z)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030310', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        color: '#5a5a8a', fontSize: 13, fontFamily: 'sans-serif', letterSpacing: '0.05em'
      }}>
        Arrow keys or WASD to move
      </div>
    </div>
  )
}
