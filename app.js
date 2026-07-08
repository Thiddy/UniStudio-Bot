// Setup 3D Viewport using Three.js
const container = document.getElementById('viewport');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Add lighting and a simple grid
const gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x334155);
scene.add(gridHelper);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle AI commands
async function sendCommand() {
    const prompt = document.getElementById('promptInput').value;
    const consoleDiv = document.getElementById('chatConsole');
    if(!prompt) return;

    consoleDiv.innerHTML += `<p class="text-white mt-2">> ${prompt}</p>`;
    consoleDiv.innerHTML += `<p class="text-yellow-400">// AI is cooking...</p>`;
    
    // Replace with your actual Render URL once deployed
    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        
        consoleDiv.innerHTML += `<p class="text-green-400">// Code generated successfully! Ready to sync.</p>`;
        
        // Example: logic to render 3D items from data.threeJSData goes here!
        
    } catch (err) {
        consoleDiv.innerHTML += `<p class="text-red-500">// Error: Could not connect to AI server.</p>`;
    }
}
