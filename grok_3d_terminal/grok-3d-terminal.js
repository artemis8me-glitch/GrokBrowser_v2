const { chromium } = require('playwright');
const WebSocket = require('ws');

// Configuration
const PORT = 8081;
const API_KEY = process.env.GROK_API_KEY;
const MODEL = 'grok-4-1-fast-reasoning';

(async () => {
  console.log("Initializing Grok 3D Matrix [Holographic Upgrade]...");
  // Launch visible browser window
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // Inject Three.js and the Holographic Scene
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      <style>body { margin: 0; overflow: hidden; background: #000; }</style>
    </head>
    <body>
      <script>
        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.02);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 15);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // --- STARRY BACKGROUND ---
        const starGeo = new THREE.BufferGeometry();
        const starCount = 3000;
        const posArray = new Float32Array(starCount * 3);
        for(let i=0; i<starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- GRID FLOOR ---
        const gridHelper = new THREE.GridHelper(100, 100, 0x004400, 0x002200);
        scene.add(gridHelper);

        // --- LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        // --- STATE ---
        const nodes = [];
        let lastNodePosition = new THREE.Vector3(0, 0, 0);
        let nodeIndex = 0;

        // --- HELPER: CREATE TEXTURE ---
        function createTextTexture(text, color) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 256;
            
            // Background glow (optional)
            // ctx.fillStyle = 'rgba(0,0,0,0.5)';
            // ctx.fillRect(0,0,512,256);

            ctx.font = 'Bold 20px Courier New';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Simple word wrap
            const words = text.split(' ');
            let line = '';
            let y = 60;
            const lineHeight = 30;
            
            for(let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              consttestWidth = metrics.width;
              if (metrics.width > 480 && n > 0) {
                ctx.fillText(line, 256, y);
                line = words[n] + ' ';
                y += lineHeight;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 256, y);

            const tex = new THREE.CanvasTexture(canvas);
            return tex;
        }

        // --- ANIMATION ---
        function animate() {
            requestAnimationFrame(animate);
            stars.rotation.y += 0.0005;
            
            // Gentle camera orbit
            const time = Date.now() * 0.0005;
            camera.position.x = Math.sin(time) * 15;
            camera.position.z = Math.cos(time) * 15;
            camera.lookAt(0, 2, 0);

            // Rotate nodes
            nodes.forEach(n => {
                n.rotation.y += 0.01;
            });

            renderer.render(scene, camera);
        }
        animate();

        // --- WINDOW RESIZE ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // --- MESSAGE HANDLER ---
        window.addEventListener('message', (e) => {
            const data = e.data;
            if (data.type === 'addNode') {
                const isUser = data.role === 'user';
                const colorHex = isUser ? '#00ffff' : '#ffcc00'; // Cyan vs Gold
                const geometry = new THREE.BoxGeometry(3, 2, 0.1);
                
                // Holographic Material
                const texture = createTextTexture(data.text, colorHex);
                const material = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    transparent: true, 
                    opacity: 0.9,
                    side: THREE.DoubleSide
                });

                const mesh = new THREE.Mesh(geometry, material);
                
                // Spiral positioning
                const angle = nodeIndex * 0.5;
                const radius = 5 + (nodeIndex * 0.2);
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = nodeIndex * 0.5 + 2;
                
                mesh.position.set(x, y, z);
                mesh.lookAt(0, y, 0); // Face center

                scene.add(mesh);
                nodes.push(mesh);

                // Draw connection line to previous node
                if (nodeIndex > 0) {
                    const points = [];
                    points.push(lastNodePosition);
                    points.push(mesh.position);
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMat = new THREE.LineBasicMaterial({ color: 0x444444 });
                    const line = new THREE.Line(lineGeo, lineMat);
                    scene.add(line);
                }

                lastNodePosition = mesh.position.clone();
                nodeIndex++;
            }
        });
      </script>
    </body>
    </html>
    `);

  console.log("Holographic Matrix Initialized.");
  console.log(`WebSocket server starting on ws://localhost:${PORT}`);

  // WebSocket server
  const wss = new WebSocket.Server({ port: PORT });

  wss.on('connection', (ws) => {
    console.log("Terminal Client Connected.");

    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      if (data.type === 'prompt') {
        console.log(`\nInvalidating Realities: "${data.text.substring(0, 50)}..."`);

        // 1. Visualize User Prompt (Cyan)
        await page.evaluate((text) => {
          window.postMessage({ type: 'addNode', role: 'user', text: text }, '*');
        }, data.text);

        // 2. Call API
        try {
          let responseText = "";
          if (!API_KEY) {
            responseText = "SIMULATION: Please set GROK_API_KEY. Holograms active.";
          } else {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
              },
              body: JSON.stringify({
                model: MODEL,
                messages: [
                  { role: "system", content: "You are Grok. Keep answers concise for holographic display." },
                  { role: "user", content: data.text }
                ],
                stream: false
              })
            });
            const json = await response.json();
            responseText = json.choices?.[0]?.message?.content || "Error: No Response";
          }

          // 3. Visualize Grok Response (Gold)
          await page.evaluate((text) => {
            window.postMessage({ type: 'addNode', role: 'assistant', text: text }, '*');
          }, responseText);

          console.log(`> GROK: ${responseText.substring(0, 50)}...`);

          // 4. Send back to Terminal
          ws.send(JSON.stringify({ type: 'response', text: responseText }));

        } catch (error) {
          console.error("Neural Link Error:", error.message);
        }
      }
    });

    // Keep alive
    ws.on('error', console.error);
  });

})();
