import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class EmpireEngine {
    constructor() {
        this.canvas = document.querySelector('#empire-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });

        this.state = {
            nodes: [],
            progress: 0, // 0 to 100
            geometry: {
                roughness: 0.2,
                metalness: 0.9,
                color: 0x06b6d4,
                distortion: 0.4,
                speed: 1.0
            }
        };

        this.init();
    }

    init() {
        // Setup Renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        // Camera
        this.camera.position.set(0, 0, 5);

        // Background Theme (Stars)
        this.scene.background = new THREE.Color(0x000000);

        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const starPositions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            starPositions[i] = (Math.random() - 0.5) * 50; // Spread stars across space
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x22d3ee, 2);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xa855f7, 2);
        pointLight2.position.set(-10, -10, -10);
        this.scene.add(pointLight2);

        // The CORE (The "Brain")
        const geometry = new THREE.IcosahedronGeometry(2, 20);
        const material = new THREE.MeshStandardMaterial({
            color: this.state.geometry.color,
            roughness: this.state.geometry.roughness,
            metalness: this.state.geometry.metalness,
            wireframe: true,
            emissive: this.state.geometry.color,
            emissiveIntensity: 0.2
        });

        this.core = new THREE.Mesh(geometry, material);
        this.scene.add(this.core);

        // Post-Processing (The "Glow")
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85));

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.nodeGroup = new THREE.Group();
        this.scene.add(this.nodeGroup);

        this.galaxyGroup = new THREE.Group();
        this.scene.add(this.galaxyGroup);
        this.galaxyGroup.visible = false; // Hidden by default
        this.isGalaxyView = false; // Initial view state

        this.loadRegistry();
        this.generateGalaxy();

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start Loop
        this.animate();
        console.log("EMPIRE ENGINE: ONLINE");
    }

    generateGalaxy() {
        // Simulating the "US National Mock-Up" - 350M+ Spheres (Scaled down)
        const particleCount = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x06b6d4); // Cyan (Tech Hubs)
        const color2 = new THREE.Color(0xa855f7); // Purple (Enterprise)
        const color3 = new THREE.Color(0xffffff); // White (Personal)
        const color4 = new THREE.Color(0xf59e0b); // Amber (New/Active)

        for (let i = 0; i < particleCount; i++) {
            // Spiral Galaxy Distribution (Golden Spiral + Arms)
            const branchAngle = (i % 3) * ((2 * Math.PI) / 3);
            const radius = Math.random() * 300 + 20;
            const spinAngle = radius * 0.01; // Spiraling effect

            // Random spread for thick arms
            const spread = 20 + Math.random() * 30; // Thicker arms

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (spread / 2);
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * spread;

            const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
            const y = randomY;
            const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Deep Space Color Logic
            const mixedColor = color3.clone();
            if (radius < 100) mixedColor.lerp(color2, 0.5); // Core is purple/dense
            if (i % 10 === 0) mixedColor.set(color1); // Tech hubs sprinkled
            if (i % 50 === 0) mixedColor.set(color4); // New active nodes

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Use a circular sprite for particles if possible, or soft point
        const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        this.galaxyParticles = new THREE.Points(geometry, material);
        this.galaxyGroup.add(this.galaxyParticles);

        // Add "Gas Giants" (Enterprise Nodes)
        for (let j = 0; j < 8; j++) {
            const giantGeo = new THREE.SphereGeometry(8, 32, 32);
            const giantMat = new THREE.MeshPhysicalMaterial({
                color: 0xa855f7,
                roughness: 0,
                transmission: 1, // Glass
                thickness: 2,
                wireframe: false,
                transparent: true,
                opacity: 0.6,
                emissive: 0x5b21b6,
                emissiveIntensity: 0.5
            });
            const giant = new THREE.Mesh(giantGeo, giantMat);

            // Add ring
            const ringGeo = new THREE.RingGeometry(10, 14, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            giant.add(ring);

            const gAngle = Math.random() * Math.pi * 2;
            const gDist = 120 + Math.random() * 150;
            giant.position.set(Math.cos(gAngle) * gDist, Math.random() * 20 - 10, Math.sin(gAngle) * gDist);
            this.galaxyGroup.add(giant);
        }
    }

    toggleGalaxyView() {
        this.isGalaxyView = !this.isGalaxyView;

        if (this.isGalaxyView) {
            // Zoom OUT to Galaxy View
            this.galaxyGroup.visible = true;
            this.core.visible = false;   // Hide local core
            this.nodeGroup.visible = false; // Hide local files

            // Animate Camera Out
            // (In a real implementation we'd tween this, simply jumping for now)
            this.camera.position.set(0, 200, 400);
            this.controls.target.set(0, 0, 0);
            console.log("VIEW MODE: GALAXY (NATIONAL REGISTRY)");
        } else {
            // Zoom IN to Local Sphere
            this.galaxyGroup.visible = false;
            this.core.visible = true;
            this.nodeGroup.visible = true;

            this.camera.position.set(0, 0, 5);
            this.controls.target.set(0, 0, 0);
            console.log("VIEW MODE: LOCAL SPHERE");
        }
    }

    async loadRegistry() {
        try {
            const res = await fetch('/registry.json');
            const registry = await res.json();

            while (this.nodeGroup.children.length > 0) {
                this.nodeGroup.remove(this.nodeGroup.children[0]);
            }

            Object.keys(registry).forEach((key, idx) => {
                const nodeData = registry[key];

                // Enhanced Color Coding
                let nodeColor = 0x22c55e; // Matrix Green
                let shape = 'box';

                if (nodeData.type === 'logic') {
                    nodeColor = 0x06b6d4; // Cyan (Logic/Scripts)
                    shape = 'sphere';
                }
                if (nodeData.type === 'data') {
                    nodeColor = 0xf59e0b; // Amber (Data)
                    shape = 'octa';
                }
                if (nodeData.name.includes('config')) nodeColor = 0xef4444; // Red (Config)

                // Create Geometry based on type
                let geometry;
                if (shape === 'sphere') geometry = new THREE.IcosahedronGeometry(0.2, 0);
                else if (shape === 'octa') geometry = new THREE.OctahedronGeometry(0.2, 0);
                else geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

                const material = new THREE.MeshStandardMaterial({
                    color: nodeColor,
                    wireframe: true,
                    emissive: nodeColor,
                    emissiveIntensity: 1.5, // Strong glow
                    transparent: true,
                    opacity: 0.9
                });

                const mesh = new THREE.Mesh(geometry, material);

                if (nodeData.coords) {
                    // Scale down coordinates
                    mesh.position.set(
                        nodeData.coords.x * 0.015,  // Slight spread
                        nodeData.coords.y * 0.015,
                        nodeData.coords.z * 0.015
                    );
                } else {
                    mesh.position.set(0, 5, 0);
                }

                // Add random rotation speed for animation
                mesh.userData = {
                    ...nodeData,
                    rotSpeed: (Math.random() - 0.5) * 0.05
                };

                this.nodeGroup.add(mesh);
            });
            console.log(`[ENGINE] Loaded ${Object.keys(registry).length} nodes.`);
        } catch (e) {
            console.warn("Registry load failed", e);
        }
    }

    updateState(newState) {
        // Update Progress (Brightness)
        if (newState.progress !== undefined) {
            this.state.progress = newState.progress;

            // Map progress (0-100) to brightness (0.2 - 5.0)
            const brightness = 0.2 + (this.state.progress / 20.0);
            this.core.material.emissiveIntensity = brightness;

            // Map progress to whiteness (Approaching "Clarity")
            if (this.state.progress > 80) {
                this.core.material.wireframe = false; // Become solid/real
            }
        }

        // Morph the sphere based on new state (The "Language")
        if (newState.geometry) {
            this.state.geometry = { ...this.state.geometry, ...newState.geometry };

            // Update Visuals
            const color = parseInt(this.state.geometry.color.replace('#', '0x'));
            this.core.material.color.setHex(color);
            this.core.material.emissive.setHex(color); // Glow color matches
            this.core.material.roughness = this.state.geometry.roughness;
            this.core.material.metalness = this.state.geometry.metalness;

            // Only update wireframe if not in high-clarity mode
            if (this.state.progress <= 80) {
                this.core.material.wireframe = this.state.geometry.wireframe;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // The "Life" Pulse
        const time = performance.now() * 0.001;
        this.core.rotation.y += 0.005 * this.state.geometry.speed;
        this.core.rotation.x = Math.sin(time * 0.5) * 0.1;

        // Rotate nodes (Local View)
        if (this.nodeGroup && this.nodeGroup.visible) {
            this.nodeGroup.rotation.y -= 0.002;
            this.nodeGroup.children.forEach((child, i) => {
                if (child.userData.rotSpeed) {
                    child.rotation.x += child.userData.rotSpeed;
                    child.rotation.y += child.userData.rotSpeed;
                } else {
                    child.rotation.x += 0.01;
                    child.rotation.y += 0.01;
                }
            });
        }

        // Rotate Galaxy (Galaxy View)
        if (this.galaxyGroup && this.galaxyGroup.visible) {
            this.galaxyGroup.rotation.y += 0.0005; // Slow majesty
        }

        // Basic "Breathing" scale effect if high energy
        const breathe = 1 + Math.sin(time * 2) * (this.state.geometry.distortion * 0.05);
        this.core.scale.set(breathe, breathe, breathe);

        this.controls.update();
        this.composer.render();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }
}
