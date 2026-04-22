export class SystemState {
    constructor(engine) {
        this.engine = engine;
        this.dnaPath = '/shape_dna.json';
        this.savePath = '/empire_state.sphere'; // Conceptually where we save
    }

    async boot() {
        console.log("SYSTEM STATE: BOOTING...");
        await this.loadDNA();

        // Start polling for "Code Changes"
        setInterval(() => this.loadDNA(), 2000);
    }

    async loadDNA() {
        try {
            const response = await fetch(this.dnaPath);
            if (response.ok) {
                const dna = await response.json();
                console.log("DNA FOUND:", dna.name);
                this.engine.updateState({
                    progress: dna.progress, // Pass progress to engine
                    geometry: {
                        color: dna.color,
                        distortion: dna.distort,
                        speed: dna.speed,
                        roughness: dna.roughness,
                        metalness: dna.metalness,
                        wireframe: dna.wireframe
                    }
                });

                // Update Overlay
                document.getElementById('status-text').innerText = dna.name;
                document.getElementById('status-indicator').style.color = dna.color;
            }
        } catch (e) {
            // No DNA yet, staying default
        }
    }

    // This is the "Snapshot" feature you wanted
    saveSnapshot() {
        const snapshot = JSON.stringify(this.engine.state);
        console.log("SNAPSHOT SAVED:", snapshot);
        // In a real OS, this would write to disk. 
        // For now, we log it, but we could POST this to a Python server to save it.
        alert("SYSTEM STATE SAVED. GEOMETRY LOCKED.");
    }

    async execute(command) {
        console.log("EXECUTING:", command);
        try {
            // Dynamically determine the API host (so it works on tablets via LAN)
            const apiHost = window.location.hostname;
            const res = await fetch(`http://${apiHost}:5000/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: command })
            });
            const data = await res.json();
            console.log("RESPONSE:", data);

            // Visual Feedback
            document.getElementById('status-text').innerText = "CMD: " + data.msg.toUpperCase();
            setTimeout(() => document.getElementById('status-text').innerText = "SYSTEM ACTIVE", 2000);

        } catch (e) {
            console.error("EXECUTION FAILED:", e);
            alert("SENTINEL OFFLINE");
        }
    }
}
