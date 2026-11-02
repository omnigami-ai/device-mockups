// The photoreal 3D devices every omnigami film and still shares: the laptop (15-inch) and the phone (6.9-inch), their
// studio light, glass and screens. A film imports it beside its own index.html:
//
//   import { studio, glassMaterial, buildLaptop, buildPhone, LAPTOP } from './devices.js';
//
// Each film keeps its own camera, finishes, scale, compositing and readback; this holds only what is the same in all
// of them, so a fix to the devices reaches every film (engine/devices.js is the source: `npm run sync` copies it into
// each skill's reference/ that already has a copy; never edit a skill's copy). The models and their CC BY credits are
// the film's own (assets/devices/*.glb and *-source.md). What the devices taught us is in make-skill's "Live 3D devices".
import * as THREE from 'three';

// a light studio of softbox strips: on metal they read as long bright reflections along edges and faces
export function studio() {
  const s = new THREE.Scene(); s.background = new THREE.Color().setScalar(0.5);
  const card = (pos, w, h, radiance) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(radiance), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  card([-4, 5, 3], 3.5, 2.5, 3.0); card([4.5, 1.5, 2.5], 0.5, 7, 12); card([-4.6, 0.5, -1.5], 0.5, 6, 8);
  card([0, 3.2, 6], 6, 0.6, 7); card([0, -3, 4], 8, 3, 1.2); card([0, 6, 0], 6, 6, 2.0); card([0, 0.5, 8], 9, 1.2, 4);
  return s;
}

// the cover glass: additive reflections only, over the screen, never hiding it
export function glassMaterial(intensity) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 0, roughness: 0.03, envMapIntensity: intensity,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 });
}

// the laptop's screen UVs stretched to 0–1, so a capture fills the display exactly
export function fitScreenUv(mesh) {
  const uv = mesh.geometry.getAttribute('uv');
  let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity;
  for (let i = 0; i < uv.count; i++) { u0 = Math.min(u0, uv.getX(i)); u1 = Math.max(u1, uv.getX(i)); v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); }
  if (u0 === 0 && v0 === 0 && u1 === 1 && v1 === 1) return;
  mesh.geometry = mesh.geometry.clone(); const o = mesh.geometry.getAttribute('uv');
  for (let i = 0; i < o.count; i++) o.setXY(i, (uv.getX(i) - u0) / (u1 - u0), (uv.getY(i) - v0) / (v1 - v0));
  o.needsUpdate = true;
}
// the phone's screen UVs projected flat from its own outline (it faces +Z): the texture spans the glass exactly, whatever
// UVs the model came with (the phone's own map a wallpaper that bleeds past the glass)
export function planarScreenUv(mesh) {
  mesh.geometry = mesh.geometry.clone(); mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox, pos = mesh.geometry.getAttribute('position'), uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x); uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y); }
  mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// The laptop: its lid's meshes (the last two are the hinge covers), its aluminium materials, and the hinge line, fitted
// in Blender (2026-10-21) so the closed lid lies flush: its glass on the base's top, its edge over the base's front.
export const LAPTOP = {
  LID: new Set(['SCREEN', 'GLASS', 'BEZEL', 'LID_BACK', 'LID_GASKET', 'CAMERA_GLASS', 'CAMERA_HOUSING', 'CAMERA_LENS', 'CAMERA_RING',
    'BASE_TyOrApjEOLhYCaF', 'BASE_xVreGKoBGSZYMij']),
  ALUMINIUM: new Set(['pEUnNAGXCoAFoUk', 'zFJMMvikHFjtmzd', 'hZBlDyddxAQhuPm', 'AvocVUvikCzzMtu', 'JKvAHnqjqlqshmY']),
  HINGE_AT: new THREE.Vector3(0, -0.0023, -0.1147),
  BASE_TILT: 20.07 * THREE.MathUtils.DEG2RAD, // the same rounding as the films' own degToRad
  LID_OPEN: 110.07 * THREE.MathUtils.DEG2RAD,
};
// Build the laptop from its loaded model (GLTFLoader's .scene): laptop ⟶ hinge ⟶ (base, lid). Its screen shows
// `screenMap` at `screenLevel`; its aluminium takes `metal` (a colour) at metalness 0.85, roughness 0.3. The camera's
// glass draws last (its materials load in either order, and the highlight otherwise differs between renders). The
// caller scales it and adds it to the scene. Returns its parts: the groups, the screen, the cover glass, the bezel,
// the camera's meshes and the aluminium materials, so a film can change any of them per shot.
export function buildLaptop(model, { screenMap, screenLevel = 0.94, metal = '#D9DADC', glass = 0.8 } = {}) {
  const laptop = new THREE.Group(), hinge = new THREE.Group(), lid = new THREE.Group();
  const baseOff = new THREE.Group(), lidOff = new THREE.Group();
  baseOff.position.copy(LAPTOP.HINGE_AT).negate(); lidOff.position.copy(LAPTOP.HINGE_AT).negate();
  laptop.add(hinge); hinge.add(baseOff); hinge.add(lid); lid.add(lidOff);
  const out = { laptop, hinge, lid, base: baseOff, screen: null, glass: null, bezel: null, camera: [], aluminium: [] };
  const lm = []; model.traverse((m) => { if (m.isMesh) lm.push(m); });
  for (const m of lm) {
    m.frustumCulled = false; if (m.name === 'CAMERA_GLASS') m.renderOrder = 1; m.updateWorldMatrix(true, false); const mw = m.matrixWorld.clone();
    if (m.name === 'SCREEN') { fitScreenUv(m); m.geometry.computeBoundingBox(); m.material = new THREE.MeshBasicMaterial({ map: screenMap, toneMapped: false, color: new THREE.Color().setScalar(screenLevel) }); out.screen = m; }
    else if (m.name === 'GLASS') { m.material = glassMaterial(glass); m.renderOrder = 10; out.glass = m; }
    else if (m.material?.isMeshStandardMaterial) {
      m.material.envMapIntensity = 1.0;
      if (LAPTOP.ALUMINIUM.has(m.material.name)) { m.material.color.set(metal); m.material.metalness = 0.85; m.material.roughness = 0.3; m.material.roughnessMap = null; out.aluminium.push(m.material); }
    }
    if (m.name === 'BEZEL') out.bezel = m;
    if (m.name.startsWith('CAMERA_')) out.camera.push(m);
    (LAPTOP.LID.has(m.name) ? lidOff : baseOff).add(m); m.matrix.copy(mw); m.matrix.decompose(m.position, m.quaternion, m.scale);
  }
  return out;
}

// The phone: its back and frame materials (the source's titanium). Build it from its loaded model in place: its screen
// shows `screenMap` at `screenLevel` (double-sided: its normals point inward), its cover glass a light sheen, its frame
// and back in `frame` and `back` (colours). The caller groups, centres, scales and places it. Returns the model, its
// screen and its finish materials, so a film can change the finish per look.
export const PHONE = { BODY: new Set(['basecolor.001', 'metalframe.002']) };
export function buildPhone(model, { screenMap, screenLevel = 0.94, frame = '#B7B1A6', back = '#C6C0B5', glass = 0.22 } = {}) {
  const out = { model, screen: null, finish: [] };
  model.traverse((m) => {
    if (!m.isMesh) return; m.frustumCulled = false;
    if (m.name === 'SCREEN') { planarScreenUv(m); m.material = new THREE.MeshBasicMaterial({ map: screenMap, toneMapped: false, color: new THREE.Color().setScalar(screenLevel), side: THREE.DoubleSide }); out.screen = m; }
    else if (m.name === 'GLASS') { m.material = glassMaterial(glass); m.renderOrder = 10; }
    // The mesh-ID render identifies Cube.016's glass as the front sensor island.
    // Object.003 / gray.001 is the bottom connector, not the island. Replace the
    // island's transmissive source glass with black dielectric glass; keep it out
    // of the frame/back finish controls so those cannot recolour the screen-off area.
    else if (m.name === 'Cube016_glass002_0' || m.name === 'Cube.016_glass.002_0') {
      m.material = new THREE.MeshPhysicalMaterial({ name: 'phone-island-glass', color: 0x000000,
        metalness: 0, roughness: 0.16, envMapIntensity: 0.08, specularIntensity: 0.025,
        clearcoat: 0.02, clearcoatRoughness: 0.12, side: THREE.DoubleSide });
    }
    else if (m.material?.isMeshStandardMaterial) {
      m.material.envMapIntensity = 1.1;
      if (m.material.name === 'metalframe.002') { m.material.color.set(frame); m.material.metalness = 0.9; m.material.roughness = 0.22; }
      else if (PHONE.BODY.has(m.material.name)) { m.material.color.set(back); m.material.metalness = 0.3; m.material.roughness = 0.35; }
      out.finish.push(m.material);
    }
  });
  return out;
}
