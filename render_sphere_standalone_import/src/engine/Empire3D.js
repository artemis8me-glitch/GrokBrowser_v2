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
        
        for(let i = 0; i < starCount * 3; i++) {
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

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start Loop
        this.animate();
        console.log("EMPIRE ENGINE: ONLINE");
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
