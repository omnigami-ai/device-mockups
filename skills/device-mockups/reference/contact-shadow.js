// A contact footprint comes from the actual world-space bottom of each mesh.
// Clip triangles to a thin band above its receiving plane, project onto that
// plane, then rasterise at 2x. No ellipse or bounding-box silhouette is used.
import * as THREE from 'three';
const cache = new Map();
// The laptop's feet lift its lower shell a few pixels above the floor. A
// two-pixel slice alone misses that shell, and opposite-winding projected
// triangles can cancel each other when their paths are filled together.
// Use two actual geometry slices and union their projections with consistent
// winding: the nearest underside supplies occlusion, the feet a darker core.
export function drawLaptopContact(ctx, base, camera, width, height, id) {
  const key = `laptop:${id}:${width}:${height}`;
  let layer = cache.get(key);
  if (!layer) {
    const makeCanvas = () => {
      const c = document.createElement('canvas'); c.width = width * 2; c.height = height * 2;
      return [c, c.getContext('2d', { willReadFrequently: true })];
    };
    base.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(base, true), floor = box.min.y;
    const centre = box.getCenter(new THREE.Vector3());
    const px = v => { const p = v.clone().project(camera); return [(p.x + 1) * width, (1 - p.y) * height]; };
    const [, y0] = px(new THREE.Vector3(centre.x, floor, centre.z));
    const [, y1] = px(new THREE.Vector3(centre.x, floor + 1, centre.z));
    const unitsPerPixel = 2 / Math.abs(y1 - y0);
    const triangles = [], size = box.getSize(new THREE.Vector3());
    let underside = Infinity;
    base.traverseVisible(mesh => {
      if (!mesh.isMesh) return;
      const bounds = new THREE.Box3().setFromObject(mesh,true), span = bounds.getSize(new THREE.Vector3());
      // Find the nearest broad, thin underbody panel. Its actual clearance is
      // larger in pixels in L1 than L2; a fixed pixel slice misses it in L1.
      // The separated rubber feet do not span the full base width/depth.
      if (span.x > size.x * 0.94 && span.z > size.z * 0.90 && span.y < size.x * 0.01)
        underside = Math.min(underside,bounds.max.y);
      const pos = mesh.geometry.getAttribute('position'), index = mesh.geometry.index;
      const verts = Array.from({ length:pos.count }, (_,i) => new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld));
      for (let i = 0, count = index ? index.count : pos.count; i < count; i += 3)
        triangles.push([0,1,2].map(j => verts[index ? index.getX(i+j) : i+j]));
    });
    const footprint = bandPixels => {
      const cutoff = floor + unitsPerPixel * bandPixels, path = new Path2D();
      for (const triangle of triangles) {
        if (triangle.every(v => v.y > cutoff)) continue;
        const clipped = [];
        for (let j = 0; j < 3; j++) {
          const a = triangle[j], b = triangle[(j+1)%3];
          if (a.y <= cutoff) clipped.push(a);
          if ((a.y <= cutoff) !== (b.y <= cutoff)) clipped.push(a.clone().lerp(b,(cutoff-a.y)/(b.y-a.y)));
        }
        if (clipped.length < 3) continue;
        const points = clipped.map(v => px(new THREE.Vector3(v.x, floor, v.z)));
        const area = points.reduce((a,p,i) => { const q=points[(i+1)%points.length]; return a+p[0]*q[1]-q[0]*p[1]; },0);
        if (area < 0) points.reverse();
        points.forEach(([x,y],i) => { if (i) path.lineTo(x,y); else path.moveTo(x,y); });
        path.closePath();
      }
      const [mask, ink] = makeCanvas(); ink.reset();
      ink.fillStyle = ink.strokeStyle = '#17191F'; ink.lineWidth = 2;
      ink.fill(path); ink.stroke(path);
      return mask;
    };
    const [result, out] = makeCanvas(); out.reset();
    // Values below are in the 2x raster: the wider falloff is only 0.65 output
    // pixels. The original broad studio shadow is composited over this layer.
    out.save(); out.filter = 'blur(1.3px)'; out.globalAlpha = 0.62;
    const undersideBand = Number.isFinite(underside)
      ? (underside - floor) / unitsPerPixel + 0.5
      : size.y * 0.35 / unitsPerPixel;
    out.drawImage(footprint(undersideBand), 0, 0); out.restore();
    out.save(); out.filter = 'blur(0.7px)'; out.globalAlpha = 0.90;
    out.drawImage(footprint(2), 0, 0); out.restore();
    cache.set(key, layer = result);
  }
  ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(layer,0,0,width,height); ctx.restore();
}
export function drawContact(ctx, objects, camera, width, height, id) {
  const key = `${id}:${width}:${height}`;
  let layer = cache.get(key);
  if (!layer) {
    layer = document.createElement('canvas'); layer.width = width * 2; layer.height = height * 2;
    const out = layer.getContext('2d', { willReadFrequently: true }); out.reset();
    const px = v => { const p = v.clone().project(camera); return [(p.x + 1) * width, (1 - p.y) * height]; };
    for (const object of objects) {
      object.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(object, true), floor = box.min.y;
      const [ax, ay] = px(new THREE.Vector3(0, floor, box.max.z));
      const [, by] = px(new THREE.Vector3(0, box.max.y, box.max.z));
      const unitsPerPixel = (box.max.y - floor) / (Math.abs(by - ay) / 2);
      const band = unitsPerPixel * 2.0, cutoff = floor + band;
      const path = new Path2D();
      object.traverseVisible(mesh => {
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.getAttribute('position'), index = mesh.geometry.index;
        const verts = Array.from({length:pos.count}, (_,i) => new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld));
        const count = index ? index.count : pos.count;
        for (let i=0; i<count; i+=3) {
          const triangle = [0,1,2].map(j=>verts[index ? index.getX(i+j) : i+j]);
          if (triangle.every(p=>p.y>cutoff)) continue;
          const clipped = [];
          for (let j=0;j<3;j++) {
            const a=triangle[j], b=triangle[(j+1)%3];
            if (a.y<=cutoff) clipped.push(a);
            if ((a.y<=cutoff)!==(b.y<=cutoff)) clipped.push(a.clone().lerp(b,(cutoff-a.y)/(b.y-a.y)));
          }
          if (clipped.length<3) continue;
          clipped.forEach((v,j)=>{
            // A broad overhead source: only the bottom 2px can occlude the
            // floor tightly; flatten the real footprint, with tiny forward spill.
            const p=new THREE.Vector3(v.x, floor, v.z+(v.y-floor)*0.25);
            const [x,y]=px(p); if(j) path.lineTo(x,y); else path.moveTo(x,y);
          }); path.closePath();
        }
      });
      out.fillStyle = '#17191F'; out.strokeStyle = '#17191F';
      out.save(); out.filter='blur(2px)'; out.globalAlpha=0.36; out.lineWidth=3.5; out.fill(path); out.stroke(path); out.restore();
      out.save(); out.filter='blur(0.6px)'; out.globalAlpha=0.58; out.lineWidth=1.6; out.fill(path); out.stroke(path); out.restore();
    }
    cache.set(key,layer);
  }
  ctx.save(); ctx.imageSmoothingQuality='high'; ctx.drawImage(layer,0,0,width,height); ctx.restore();
}
