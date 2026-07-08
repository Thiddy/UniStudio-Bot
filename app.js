let scene, camera, renderer;
let activeApiKey = "";

// Function running when the unlock button is pressed
function validateAndUnlock() {
    const keyInput = document.getElementById('apiKey').value.trim();
    
    if (keyInput.length < 15) {
        alert("Invalid Key Format. Please ensure you copied the full Roblox Open Cloud token.");
        return;
    }

    activeApiKey = keyInput;

    // Swap displays: Hide lockscreen, show workspace
    document.getElementById('lockScreen').remove();
    const workspace = document.getElementById('mainWorkspace');
    workspace.classList.remove('hidden');

    // Run the 3D render engine since workspace is now visible
    initThreeJS();
}

// Initialize ThreeJS Viewport
function initThreeJS() {
    const container = document.getElementById('viewport');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x334155);
    scene.add(gridHelper);
    
    // Ambient lighting so we can see object colors beautifully
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

// Helper function to render AI data into the 3D Viewport
function renderAIObjects(threeJSData) {
    if (!threeJSData || !Array.isArray(threeJSData)) return;

    // Clear old AI generated structures first before drawing new ones
    scene.children = scene.children.filter(child => {
        if (child instanceof THREE.Mesh) {
            scene.remove(child);
            return false;
        }
        return true;
    });

    threeJSData.forEach(obj => {
        // Default size box if none specified
        const geometry = new THREE.BoxGeometry(obj.sizeX || 2, obj.sizeY || 2, obj.sizeZ || 2);
        
        // Give it a glowing neon emissive material to look "tuff"
        const material = new THREE.MeshStandardMaterial({
            color: obj.color || 0x06b6d4,
            emissive: obj.color || 0x06b6d4,
            emissiveIntensity: 0.3,
            roughness: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(obj.x || 0, obj.y || 0, obj.z || 0);
        scene.add(mesh);
    });
}

// Handle AI generation commands
async function sendCommand() {
    const prompt = document.getElementById('promptInput').value.trim();
    const chatConsole = document.getElementById('chatConsole');
    if (!prompt) return;

    chatConsole.innerHTML += `
        <div class="mt-4 border-l-2 border-cyan-500 pl-2">
            <span class="text-slate-500 font-bold">[YOU]:</span> <span class="text-white">${prompt}</span>
        </div>
    `;
    
    const loadingId = "loading-" + Date.now();
    chatConsole.innerHTML += `
        <div id="${loadingId}" class="text-yellow-400 animate-pulse mt-1">
            🤖 <span class="font-bold">UniStudio Bot:</span> Cooking up your asset calculations...
        </div>
    `;
    
    document.getElementById('promptInput').value = "";
    chatConsole.scrollTop = chatConsole.scrollHeight;

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, apiKey: activeApiKey }) 
        });
        
        const data = await response.json();
        document.getElementById(loadingId).remove();
        
        // Print the code block cleaner to avoid "undefined" strings
        const displayCode = data.luaCode ? data.luaCode.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "No Luau modifications generated.";

        chatConsole.innerHTML += `
            <div class="mt-2 text-green-400">
                <span class="font-bold">🤖 UniStudio Bot:</span> Generation Complete.
                <div class="text-xs text-slate-400 mt-1">Generated Execution Script:</div>
                <pre class="bg-black/60 p-2 rounded text-xs text-cyan-300 mt-1 max-h-32 overflow-y-auto">${displayCode}</pre>
            </div>
        `;
        
        // Instantly generate the physical boxes on your screen layout!
        if (data.threeJSData) {
            renderAIObjects(data.threeJSData);
        }
        
    } catch (err) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        chatConsole.innerHTML += `
            <div class="mt-2 text-red-500 font-bold">
                ❌ Error: AI engine failed to return a proper JSON layout configuration.
            </div>
        `;
    }
    chatConsole.scrollTop = chatConsole.scrollHeight;
}
