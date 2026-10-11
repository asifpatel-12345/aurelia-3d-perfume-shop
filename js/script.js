const products = [
  { name: "Royal Oud", note: "Oud • Amber • Musk", price: 2499, color: 0xc77b30 },
  { name: "Midnight Rose", note: "Rose • Vanilla • Patchouli", price: 1999, color: 0xc2185b },
  { name: "Ocean Breeze", note: "Citrus • Sea Salt • Mint", price: 1799, color: 0x1fa2d6 },
  { name: "Emerald Noir", note: "Green Tea • Cedar • Vetiver", price: 2199, color: 0x1e9e6a },
  { name: "Violet Dream", note: "Lavender • Iris • Sandalwood", price: 2099, color: 0x8e44ad }
];

// ---------- 3D SCENE ----------
const canvas = document.getElementById("scene");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.5, 7);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const key = new THREE.PointLight(0xffffff, 1.2); key.position.set(5, 5, 6); scene.add(key);
const rim = new THREE.PointLight(0xd4af37, 1.5); rim.position.set(-5, 2, -3); scene.add(rim);

const bottle = new THREE.Group();
const glass = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.1, 2.4, 64),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, roughness: 0, metalness: 0.1, clearcoat: 1 })
);
const liquidMat = new THREE.MeshPhysicalMaterial({ color: products[0].color, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.9 });
const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 2.0, 64), liquidMat);
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.25 });
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.4, 32), goldMat);
neck.position.y = 1.4;
const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.9, 48), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 }));
cap.position.y = 2.05;
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.05, 16, 48), goldMat);
ring.rotation.x = Math.PI / 2; ring.position.y = 1.6;
bottle.add(glass, liquid, neck, cap, ring);
bottle.position.set(2.2, -0.9, 0);
scene.add(bottle);

// floating sparkles
const pts = new Float32Array(300 * 3).map(() => (Math.random() - 0.5) * 16);
const sparkGeo = new THREE.BufferGeometry();
sparkGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
const sparkles = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xd4af37, size: 0.05 }));
scene.add(sparkles);

// drag to rotate
let dragging = false, lastX = 0, velocity = 0.008;
canvas.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; canvas.style.cursor = "grabbing"; });
addEventListener("pointerup", () => { dragging = false; canvas.style.cursor = "grab"; });
addEventListener("pointermove", e => {
  if (!dragging) return;
  velocity = (e.clientX - lastX) * 0.01;
  bottle.rotation.y += velocity; lastX = e.clientX;
});

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  bottle.position.x = w < 700 ? 0 : 2.2;
  bottle.position.y = w < 700 ? -1.6 : -0.9;
}
addEventListener("resize", resize); resize();

let t = 0;
(function animate() {
  requestAnimationFrame(animate);
  t += 0.02;
  if (!dragging) bottle.rotation.y += 0.006;
  bottle.position.y += Math.sin(t) * 0.0015;
  sparkles.rotation.y += 0.0008;
  renderer.render(scene, camera);
})();

// ---------- SHOP UI ----------
const hex = c => "#" + c.toString(16).padStart(6, "0");
const swatches = document.getElementById("swatches");
const grid = document.getElementById("grid");
let cart = 0;

function setScent(i) {
  liquidMat.color.setHex(products[i].color);
  document.querySelectorAll(".swatch").forEach((s, idx) => s.classList.toggle("active", idx === i));
}

products.forEach((p, i) => {
  const s = document.createElement("div");
  s.className = "swatch" + (i === 0 ? " active" : "");
  s.style.background = hex(p.color); s.title = p.name;
  s.onclick = () => setScent(i);
  swatches.appendChild(s);

  const c = document.createElement("div");
  c.className = "card";
  c.innerHTML = `
    <div class="bottle" style="background:linear-gradient(${hex(p.color)},#000)"></div>
    <h3>${p.name}</h3><p>${p.note}</p>
    <div class="price">₹${p.price}</div>
    <button data-view="${i}">View in 3D</button>
    <button data-add="${i}">Add to Cart</button>`;
  grid.appendChild(c);
});

grid.addEventListener("click", e => {
  if (e.target.dataset.view !== undefined) {
    setScent(+e.target.dataset.view);
    document.getElementById("home").scrollIntoView();
  }
  if (e.target.dataset.add !== undefined) {
    document.getElementById("cartCount").textContent = ++cart;
  }
});