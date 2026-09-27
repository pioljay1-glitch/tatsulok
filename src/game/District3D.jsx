import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { missionChoices } from "./MissionSystem";

export default function District3D({ mission, activeCharacter, playerName, onExit, onComplete }) {
  const mountRef = useRef(null);
  const playerRef = useRef({ x: 0, z: 14, yaw: 0, pitch: 0, running: false });
  const keysRef = useRef({});
  const joyRef = useRef({ active: false, x: 0, y: 0 });
  const lookRef = useRef({ active: false, id: null, x: 0, y: 0 });
  const stageRef = useRef(0);
  const interactRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [objective, setObjective] = useState("REACH THE FLOODED AREA");
  const [canInteract, setCanInteract] = useState(false);
  const [interactLabel, setInteractLabel] = useState("APPROACH");
  const [dialogue, setDialogue] = useState(null);
  const [choices, setChoices] = useState(null);
  const [running, setRunning] = useState(false);
  const [locked, setLocked] = useState(false);

  const ROUTE = { flood: { x: 0, z: -18 }, survivor: { x: 5, z: -38 }, clue: { x: -5, z: -52 }, side: { x: 7, z: -74 }, supplies: { x: -6, z: -88 }, evac: { x: 0, z: -118 } };
  const STAGES = [
    { name: "REACH THE FLOODED AREA", pos: ROUTE.flood },
    { name: "FIND THE SURVIVOR", pos: ROUTE.survivor, talk: "TALK" },
    { name: "INVESTIGATE THE CLUE", pos: ROUTE.clue, talk: "INVESTIGATE" },
    { name: "FIND ANOTHER WAY THROUGH", pos: ROUTE.side },
    { name: "COLLECT RELIEF SUPPLIES", pos: ROUTE.supplies, talk: "COLLECT" },
    { name: "REACH THE EVACUATION CENTER", pos: ROUTE.evac, talk: "INTERACT" }
  ];

  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.code] = true;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") { playerRef.current.running = true; setRunning(true); }
      if (e.code === "KeyE") doInteract();
      if (e.code === "Escape") document.exitPointerLock?.();
    };
    const up = (e) => {
      keysRef.current[e.code] = false;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") { playerRef.current.running = false; setRunning(false); }
    };
    const onLock = () => setLocked(!!document.pointerLockElement);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2c38);
    scene.fog = new THREE.Fog(0x1a2c38, 40, 160);
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.08, 220);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);
    const lamb = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });
    const addBox = (w, h, d, mat, x, y, z, parent = scene) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    const ground = lamb(0x5f6564);
    const road = lamb(0x1c2427);
    const walk = lamb(0x969794);
    const roof = lamb(0x2c3233);
    const dark = lamb(0x3d4344);
    const wood = lamb(0x714529);
    const green = lamb(0x245d3a);
    const yellow = new THREE.MeshBasicMaterial({ color: 0xffc52e });
    const windowMat = lamb(0x24566b, { emissive: 0x08242e });
    const water = lamb(0x245f76, { transparent: true, opacity: 0.78 });
    const red = lamb(0x8e2626);
    addBox(120, 0.35, 230, ground, 0, -0.2, -55);
    addBox(20, 0.12, 210, road, 0, 0, -55);
    addBox(8, 0.2, 210, walk, -14, 0.1, -55);
    addBox(8, 0.2, 210, walk, 14, 0.1, -55);
    for (let z = 12; z > -165; z -= 8) addBox(0.18, 0.04, 3.5, yellow, 0, 0.08, z);
    addBox(42, 0.12, 12, road, -18, 0, -74);
    addBox(38, 0.12, 12, road, 18, 0, -101);
    const colliders = [];
    const addCol = (x, z, w, d) => colliders.push({ x, z, hw: w / 2, hd: d / 2 });
    const building = (x, z, w, d, h, color) => {
      addBox(w, h, d, lamb(color), x, h / 2, z);
      addBox(w + 0.5, 0.35, d + 0.5, roof, x, h + 0.15, z);
      addCol(x, z, w, d);
      const cols = Math.max(2, Math.floor(w / 3));
      const rows = Math.max(2, Math.floor(h / 3));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          addBox(1.15, 1.1, 0.08, windowMat, x - w / 2 + 1.4 + c * 2.7, 2 + r * 2.7, z + d / 2 + 0.03);
        }
      }
    };
    building(-25, -5, 18, 17, 14, 0x6e7372);
    building(-25, -32, 16, 16, 10, 0x825d4f);
    building(-25, -58, 18, 18, 15, 0x666c6b);
    building(-25, -91, 17, 17, 12, 0x7c6256);
    building(-25, -122, 19, 17, 14, 0x646b6b);
    building(25, -8, 18, 18, 17, 0x60696b);
    building(25, -35, 17, 17, 13, 0x78584c);
    building(25, -61, 18, 18, 16, 0x696f6f);
    building(25, -92, 17, 17, 11, 0x7b6155);
    building(25, -122, 20, 18, 15, 0x626a6b);
    for (let z = 8; z > -155; z -= 13) {
      [-1, 1].forEach((side) => {
        addBox(0.12, 5, 0.12, dark, side * 8.8, 2.5, z);
        addBox(0.55, 0.18, 0.55, yellow, side * 8.8, 5.05, z);
      });
    }
    const tree = (x, z) => {
      addBox(0.45, 4.5, 0.45, wood, x, 2.25, z);
      const crown = new THREE.Group();
      crown.position.set(x, 5, z);
      scene.add(crown);
      for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 5), green);
        leaf.rotation.z = Math.PI / 2.2;
        leaf.rotation.y = (Math.PI * 2 * i) / 7;
        crown.add(leaf);
      }
    };
    [[-9, -14], [9, -23], [-9, -45], [9, -51], [-9, -78], [9, -82], [-9, -112], [9, -116]].forEach(([x, z]) => tree(x, z));
    const flood = new THREE.Mesh(new THREE.BoxGeometry(19, 0.16, 22), water);
    flood.position.set(0, 0.12, -20);
    scene.add(flood);
    const npc = new THREE.Group();
    npc.position.set(5, 0, -38);
    scene.add(npc);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 4, 8), lamb(0x274a56));
    body.position.y = 1;
    npc.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), lamb(0xc88b69));
    head.position.y = 2.05;
    npc.add(head);
    const clue = new THREE.Group();
    clue.position.set(-5, 0, -52);
    scene.add(clue);
    const clueBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.18), yellow);
    clueBox.position.y = 0.8;
    clue.add(clueBox);
    addBox(14, 1, 0.4, red, 0, 1, -68);
    addBox(0.3, 2.5, 0.3, dark, -6, 1.25, -68);
    addBox(0.3, 2.5, 0.3, dark, 6, 1.25, -68);
    const supplies = new THREE.Group();
    supplies.position.set(-6, 0, -88);
    scene.add(supplies);
    for (let i = 0; i < 3; i++) addBox(1.1, 0.8, 1, wood, i * 1.15, 0.4, 0, supplies);
    const evac = new THREE.Group();
    evac.position.set(0, 0, -122);
    scene.add(evac);
    addBox(22, 9, 16, lamb(0x747a79), 0, 4.5, 0, evac);
    addBox(23, 0.4, 17, roof, 0, 9.2, 0, evac);
    addBox(5, 5, 0.25, dark, 0, 2.5, 8.1, evac);
    addBox(12, 0.7, 0.3, red, 0, 6.5, 8.25, evac);
    const marker = new THREE.Group();
    scene.add(marker);
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), yellow);
    diamond.position.y = 3.4;
    marker.add(diamond);
    scene.add(new THREE.HemisphereLight(0xcee8ff, 0x18211f, 1.6));
    const sun = new THREE.DirectionalLight(0xfff0d0, 1.2);
    sun.position.set(-30, 60, 20);
    scene.add(sun);
    const blocked = (x, z) => {
      if (x < -8.9 || x > 8.9) {
        if (z > -79 && z < -69) return false;
        if (z > -106 && z < -96) return false;
        if (Math.abs(x) < 18 && ((z > -79 && z < -69) || (z > -106 && z < -96))) return false;
        if (Math.abs(x) > 22) return true;
      }
      for (const b of colliders) {
        if (x > b.x - b.hw - 0.55 && x < b.x + b.hw + 0.55 && z > b.z - b.hd - 0.55 && z < b.z + b.hd + 0.55) return true;
      }
      if (z < -67 && z > -70 && Math.abs(x) < 6.8) return true;
      if (z < -114 && Math.abs(x) < 10 && Math.abs(x) > 2.8) return true;
      if (z > 16 || z < -140) return true;
      return false;
    };
    const near = (a, b, r) => Math.hypot(a.x - b.x, a.z - b.z) <= r;
    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.04);
      const p = playerRef.current;
      const keys = keysRef.current;
      let mx = 0, mz = 0;
      if (keys.KeyW || keys.ArrowUp) mz += 1;
      if (keys.KeyS || keys.ArrowDown) mz -= 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;
      mx += joyRef.current.x;
      mz += -joyRef.current.y;
      const len = Math.hypot(mx, mz);
      if (len > 1) { mx /= len; mz /= len; }
      const speed = p.running ? 7.2 : 4.4;
      const fwdX = -Math.sin(p.yaw);
      const fwdZ = -Math.cos(p.yaw);
      const rightX = Math.cos(p.yaw);
      const rightZ = -Math.sin(p.yaw);
      const nx = p.x + (rightX * mx + fwdX * mz) * speed * dt;
      const nz = p.z + (rightZ * mx + fwdZ * mz) * speed * dt;
      if (!blocked(nx, p.z)) p.x = nx;
      if (!blocked(p.x, nz)) p.z = nz;
      camera.position.set(p.x, 1.68, p.z);
      camera.rotation.order = "YXZ";
      camera.rotation.y = p.yaw;
      camera.rotation.x = p.pitch;
      const stage = STAGES[stageRef.current];
      if (stage) {
        marker.position.set(stage.pos.x, 0, stage.pos.z);
        diamond.rotation.y += dt * 2;
        diamond.position.y = 3.2 + Math.sin(performance.now() * 0.003) * 0.25;
        const meters = Math.round(Math.hypot(p.x - stage.pos.x, p.z - stage.pos.z));
        setDistance(meters);
        if (stageRef.current === 0 && meters <= 6) { stageRef.current = 1; setObjective(STAGES[1].name); }
        if (stageRef.current === 3 && p.z < -72) { stageRef.current = 4; setObjective(STAGES[4].name); }
        const talk = stage.talk && near(p, stage.pos, stageRef.current === 5 ? 6 : 3.2);
        setCanInteract(!!talk);
        setInteractLabel(talk ? stage.talk : "APPROACH");
        interactRef.current = talk ? stageRef.current : null;
      }
      npc.rotation.y = Math.sin(performance.now() * 0.0008) * 0.12;
      clue.rotation.y += dt * 1.3;
      renderer.render(scene, camera);
    };
    tick();
    const resize = () => {
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  const doInteract = () => {
    const s = interactRef.current;
    if (s === null || s === undefined) return;
    if (s === 1) {
      setDialogue({ title: "SURVIVOR", text: `Tulungan mo kami${playerName ? ", " + playerName : ""}. Maraming residente ang naiwan dahil mabilis na tumaas ang tubig.` });
      stageRef.current = 2; setObjective(STAGES[2].name); setCanInteract(false);
    } else if (s === 2) {
      setDialogue({ title: "DAMAGED REPORT", text: "May report tungkol sa paglikas. Ang evacuation center ay nasa kabilang dulo — pero may harang sa daan." });
      stageRef.current = 3; setObjective(STAGES[3].name); setCanInteract(false);
    } else if (s === 4) {
      setDialogue({ title: "RELIEF SUPPLIES", text: "Nakuha mo ang mga relief supplies. Dalhin ang mga ito sa evacuation center." });
      stageRef.current = 5; setObjective(STAGES[5].name); setCanInteract(false);
    } else if (s === 5) {
      setChoices(missionChoices);
    }
  };

  const onLookDown = (e) => {
    if (e.target.closest(".td-ui")) return;
    if (e.pointerType === "mouse") { mountRef.current?.requestPointerLock?.(); return; }
    lookRef.current = { active: true, id: e.pointerId, x: e.clientX, y: e.clientY };
  };
  const onLookMove = (e) => {
    const p = playerRef.current;
    if (document.pointerLockElement) {
      p.yaw -= e.movementX * 0.0024;
      p.pitch = THREE.MathUtils.clamp(p.pitch - e.movementY * 0.002, -1.2, 1.2);
      return;
    }
    if (!lookRef.current.active || lookRef.current.id !== e.pointerId) return;
    const dx = e.clientX - lookRef.current.x;
    const dy = e.clientY - lookRef.current.y;
    lookRef.current.x = e.clientX; lookRef.current.y = e.clientY;
    p.yaw -= dx * 0.004;
    p.pitch = THREE.MathUtils.clamp(p.pitch - dy * 0.003, -1.2, 1.2);
  };
  const onLookUp = (e) => { if (lookRef.current.id === e.pointerId) lookRef.current.active = false; };
  const joyDown = (e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); joyRef.current.active = true; updateJoy(e); };
  const updateJoy = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    let y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const l = Math.hypot(x, y) || 1;
    if (l > 1) { x /= l; y /= l; }
    joyRef.current.x = x; joyRef.current.y = y;
  };
  const joyUp = () => { joyRef.current = { active: false, x: 0, y: 0 }; };
  const pickChoice = (choice) => {
    try {
      const prev = JSON.parse(localStorage.getItem("tatsulok-choices") || "[]");
      prev.push({ mission: mission?.id, choice: choice.id, character: activeCharacter?.id, at: Date.now() });
      localStorage.setItem("tatsulok-choices", JSON.stringify(prev));
    } catch {}
    setChoices(null);
    setDialogue({ title: choice.title, text: choice.description + " Ang bawat desisyon ay may kapalit.", done: true });
  };

  return (
    <div ref={mountRef} className="tatsulok-district" onPointerDown={onLookDown} onPointerMove={onLookMove} onPointerUp={onLookUp} onPointerCancel={onLookUp}>
      <div className="td-crosshair" />
      <div className="td-hud td-ui">
        <button className="td-back" onClick={onExit}>← BACK</button>
        <div className="td-top">
          <div className="td-kicker">MISSION {mission?.number || "01"} · FIRST PERSON</div>
          <div className="td-title">{mission?.title || "EVACUATION CENTER"}</div>
          <div className="td-sub">{mission?.district || "DISTRICT 7"} · {activeCharacter?.name || "PLAYER"}</div>
        </div>
        <div className="td-obj"><span>OBJECTIVE</span><strong>{objective}</strong><em>{distance}m</em></div>
      </div>
      {!locked && <div className="td-hint td-ui">CLICK TO LOOK · WASD TO MOVE · E TO INTERACT</div>}
      <div className="td-controls td-ui">
        <div className="td-joy" onPointerDown={joyDown} onPointerMove={(e) => joyRef.current.active && updateJoy(e)} onPointerUp={joyUp} onPointerCancel={joyUp}><i /></div>
        <div className="td-actions">
          <button className="td-run" onPointerDown={() => { playerRef.current.running = true; setRunning(true); }} onPointerUp={() => { playerRef.current.running = false; setRunning(false); }} onPointerCancel={() => { playerRef.current.running = false; setRunning(false); }}>{running ? "RUNNING" : "RUN"}</button>
          <button className={"td-use" + (canInteract ? " ready" : "")} disabled={!canInteract} onClick={doInteract}>{canInteract ? interactLabel : "APPROACH"}</button>
        </div>
      </div>
      {dialogue && (
        <div className="td-modal td-ui">
          <div className="td-box">
            <span>MISSION EVENT</span>
            <h2>{dialogue.title}</h2>
            <p>{dialogue.text}</p>
            <button onClick={() => { if (dialogue.done) onComplete?.(); else setDialogue(null); }}>{dialogue.done ? "RETURN TO MISSIONS" : "CONTINUE"}</button>
          </div>
        </div>
      )}
      {choices && (
        <div className="td-modal td-ui">
          <div className="td-box">
            <span>DESISYON</span>
            <h2>Evacuation Center</h2>
            <p>May mga taong nangangailangan ng tulong. Ano ang iyong gagawin?</p>
            <div className="td-choices">{choices.map((c) => (<button key={c.id} onClick={() => pickChoice(c)}>{c.title}</button>))}</div>
          </div>
        </div>
      )}
    </div>
  );
}
