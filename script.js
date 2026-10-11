
// Get the SVG heart path
const path = document.querySelector("#heartSvg path");
const canvas = document.querySelector("#heartCanvas");

// Three.js scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.z = 850;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);

// Heart group
const heartGroup = new THREE.Group();
scene.add(heartGroup);

// Read the SVG path
const length = path.getTotalLength();
const vertices = [];
const targets = [];

for (let i = 0; i <= length; i += 0.8) {
    const point = path.getPointAtLength(i);

    // Convert SVG coordinates to centered 3D coordinates
    const target = new THREE.Vector3(
        point.x - 300 + (Math.random() - 0.5) * 8,
        276 - point.y + (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 50
    );

    // Initial positions: particles start scattered
    const vertex = new THREE.Vector3(
        (Math.random() - 0.5) * 900,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 300
    );

    vertices.push(vertex);
    targets.push(target);
}

// Create particle geometry
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(vertices.length * 3);

vertices.forEach((vertex, i) => {
    positions[i * 3] = vertex.x;
    positions[i * 3 + 1] = vertex.y;
    positions[i * 3 + 2] = vertex.z;
});

geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
);

// Bright pink particles
const particleMaterial = new THREE.PointsMaterial({
    color: 0xff174f,
    size: 2.2,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

// Soft glow around particles
const glowMaterial = new THREE.PointsMaterial({
    color: 0xff003c,
    size: 7,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});

// Add both particle layers
const glowPoints = new THREE.Points(geometry, glowMaterial);
const heartPoints = new THREE.Points(geometry, particleMaterial);

heartGroup.add(glowPoints);
heartGroup.add(heartPoints);

// Update the geometry during animation
function updateGeometry() {
    const positionAttribute = geometry.attributes.position;

    vertices.forEach((vertex, i) => {
        positionAttribute.setXYZ(
            i,
            vertex.x,
            vertex.y,
            vertex.z
        );
    });

    positionAttribute.needsUpdate = true;
}

// Animate particles into the heart shape
const tl = gsap.timeline();

vertices.forEach((vertex, i) => {
    const target = targets[i];

    tl.to(
        vertex,
        {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: gsap.utils.random(2, 5),
            ease: "power2.inOut",
            onUpdate: updateGeometry
        },
        Math.random() * 2
    );
});

// Subtle heartbeat after the formation animation
tl.call(() => {
    gsap.to(heartGroup.scale, {
        x: 1.035,
        y: 1.035,
        z: 1.035,
        duration: 0.45,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
});

// Responsive sizing
function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Keep the heart visible on narrow screens
    const scale = Math.min(
        window.innerWidth / 760,
        window.innerHeight / 680,
        1
    );

    heartGroup.scale.setScalar(scale);
}

window.addEventListener("resize", resize);
resize();

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Gentle 3D movement
    heartGroup.rotation.y = Math.sin(Date.now() * 0.0004) * 0.06;

    renderer.render(scene, camera);
}

animate();
