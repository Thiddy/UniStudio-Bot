let scene, camera, renderer;
let activeApiKey = "";

// Function running when the unlock button is pressed
function validateAndUnlock() {
    const keyInput = document.getElementById('apiKey').value.trim();
    
    // Check if the input looks valid (Roblox API keys are long tokens)
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

// Separate setup to initialize ThreeJS only after DOM is displayed
function initThreeJS() {
    const container = document.getElementById('viewport');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

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
            🤖 <span class="font-bold">UniStudio Bot:</span> Parsing architectural constraints...
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
        
        chatConsole.innerHTML += `
            <div class="mt-2 text-green-400">
                <span class="font-bold">🤖 UniStudio Bot:</span> Generation Complete.
                <pre class="bg-black/60 p-2 rounded text-xs text-slate-300 mt-1 max-h-32 overflow-y-auto">${JSON.stringify(data.threeJSData, null, 2)}</pre>
            </div>
        `;
        
    } catch (err) {
        if(document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        chatConsole.innerHTML += `
            <div class="mt-2 text-red-500 font-bold">
                ❌ Error: Asset creation pipeline timed out.
            </div>
        `;
    }
    chatConsole.scrollTop = chatConsole.scrollHeight;
}
