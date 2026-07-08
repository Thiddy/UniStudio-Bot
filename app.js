// Setup 3D Viewport using Three.js
const container = document.getElementById('viewport');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x334155);
scene.add(gridHelper);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// --- NEW CODE FOR API LOCK & CHAT UPGRADES ---

const chatConsole = document.getElementById('chatConsole');
const apiKeyInput = document.getElementById('apiKey');

// Show instructions on startup
function showSetupInstructions() {
    chatConsole.innerHTML = `
        <div class="text-yellow-400 font-bold mb-2">🔒 ACCESS LOCKED: ROBLOX API KEY REQUIRED</div>
        <p class="text-slate-400 mb-4">Please input a valid Roblox Open Cloud API Key in the top right to initialize the workspace.</p>
        
        <div class="text-cyan-400 font-bold mb-1">💡 How to create your API Key:</div>
        <ol class="list-decimal list-inside text-slate-300 space-y-1 text-xs">
            <li>Go to the <span class="text-white">Roblox Creator Dashboard</span> (create.roblox.com).</li>
            <li>Navigate to <span class="text-white">Credentials</span> -> <span class="text-white">API Keys</span>.</li>
            <li>Click <span class="text-white">Create API Key</span>.</li>
            <li>Add these permissions: <span class="text-cyan-400">Universe Places (Write)</span>.</li>
            <li>Set IP Restrictions to <span class="text-yellow-500">0.0.0.0/0</span> (so Render can access it).</li>
            <li>Copy the generated key and paste it above!</li>
        </ol>
    `;
}
showSetupInstructions();

// Listen for the user typing in the API key field
apiKeyInput.addEventListener('input', () => {
    if (apiKeyInput.value.trim().length > 10) {
        chatConsole.innerHTML = `<p class="text-green-400 font-bold">// SYSTEM: API Key detected. UniStudio Bot online and ready to build!</p>`;
    } else if (apiKeyInput.value.trim().length === 0) {
        showSetupInstructions();
    }
});

// Upgraded send command logic
async function sendCommand() {
    const prompt = document.getElementById('promptInput').value;
    const apiKey = apiKeyInput.value.trim();
    
    if (!prompt) return;

    // Guard rail: Block generation if key is missing
    if (!apiKey) {
        alert("You must enter a Roblox API Key in the top right before talking to the AI!");
        return;
    }

    // Append user message beautifully
    chatConsole.innerHTML += `
        <div class="mt-4 border-l-2 border-cyan-500 pl-2">
            <span class="text-slate-500 font-bold">[YOU]:</span> <span class="text-white">${prompt}</span>
        </div>
    `;
    
    // Smooth loading indicator
    const loadingId = "loading-" + Date.now();
    chatConsole.innerHTML += `
        <div id="${loadingId}" class="text-yellow-400 animate-pulse mt-1">
            🤖 <span class="font-bold">UniStudio Bot:</span> Cooking up your asset calculations...
        </div>
    `;
    
    document.getElementById('promptInput').value = ""; // Clear input field
    chatConsole.scrollTop = chatConsole.scrollHeight; // Auto-scroll

    try {
        // Automatically uses the relative server endpoint relative to your Render URL
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, apiKey }) 
        });
        
        const data = await response.json();
        
        // Remove loading state
        document.getElementById(loadingId).remove();
        
        // Output successful structural breakdown
        chatConsole.innerHTML += `
            <div class="mt-2 text-green-400">
                <span class="font-bold">🤖 UniStudio Bot:</span> Structure blueprint processed successfully! 
                <pre class="bg-black/60 p-2 rounded text-xs text-slate-300 mt-1 max-h-32 overflow-y-auto">${JSON.stringify(data.threeJSData, null, 2)}</pre>
            </div>
        `;
        
        // TODO: Map data.threeJSData arrays directly into Three.js object generator here!
        
    } catch (err) {
        document.getElementById(loadingId).remove();
        chatConsole.innerHTML += `
            <div class="mt-2 text-red-500 font-bold">
                ❌ Error: AI engine timed out or failed to reach Render server pipeline.
            </div>
        `;
    }
    chatConsole.scrollTop = chatConsole.scrollHeight;
}
