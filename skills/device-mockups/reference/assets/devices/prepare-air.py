# Prepare "Apple Macbook Air 15 (Space Gray) 2023" by akshatmittal (CC BY 4.0) for omnigami's device film:
# bake transforms, delete the Apple mark, drop the macOS wallpaper, name parts for the device contract,
# stand the lid upright (screen facing glTF +Z), export a GLB.
import bpy, sys, math, mathutils
src, out = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
# bake every node transform into the mesh data, then drop the empties
for o in meshes:
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in [o for o in bpy.data.objects if o.type != 'MESH']: bpy.data.objects.remove(o)
by = {o.name: o for o in meshes}
NAMES = {
  'SadnAkehSlxIwKv': 'SCREEN', 'biHEvGDNnTqamRb': 'GLASS', 'aLWGnOLpsFWVSfy': 'BEZEL', 'hczGzWOWpedUDYd_0': 'LID_BACK',
  'vrIckaCELZpnnNK': 'LID_GASKET', 'MaufYfIBnxcfRgH': 'CAMERA_HOUSING', 'NqUinIWcwSlXpvt': 'CAMERA_GLASS',
  'WDUVUVPpNjdIPkb': 'CAMERA_LENS', 'aIqeGXayDxWnOWQ': 'CAMERA_RING',
}
LOGO = 'OrhpMXCxeprcNok'
bpy.data.objects.remove(by.pop(LOGO))
for old, o in by.items():
    o.name = NAMES.get(old, 'BASE_' + old.rstrip('_0'))
    o.data.name = o.name
lid = [o for o in bpy.data.objects if o.name in NAMES.values()]
screen = bpy.data.objects['SCREEN']
# the screen: a plain material (no wallpaper image ships), named for the contract
m = bpy.data.materials.new('screen'); m.use_nodes = True
screen.data.materials.clear(); screen.data.materials.append(m)
for img in list(bpy.data.images):
    if 'VNZklas' in img.name: bpy.data.images.remove(img)
# the lid's lean: the screen's average normal
n = mathutils.Vector()
for p in screen.data.polygons: n += p.normal * p.area
n.normalize()
lean = math.degrees(math.atan2(n.z, -n.y))   # 0 when the screen faces -Y (glTF +Z) exactly
# the hinge: the lid's lowest, front-most edge
zs = [ (o.matrix_world @ v.co) for o in lid for v in o.data.vertices ]
hz = min(v.z for v in zs); hy = min(v.y for v in zs if v.z < hz + 0.004)
print('LEAN_DEG', round(lean, 3), 'HINGE_Y', round(hy, 4), 'HINGE_Z', round(hz, 4))
# stand the lid upright: rotate everything about the hinge line (X axis) by the lean
R = mathutils.Matrix.Translation((0, hy, hz)) @ mathutils.Matrix.Rotation(math.radians(lean), 4, 'X') @ mathutils.Matrix.Translation((0, -hy, -hz))
for o in bpy.data.objects:
    o.data.transform(R); o.data.update()
n2 = mathutils.Vector()
for p in screen.data.polygons: n2 += p.normal * p.area
print('SCREEN_NORMAL_AFTER', [round(x, 4) for x in n2.normalized()])
root = bpy.data.objects.new('macbook-air-15', None); bpy.context.collection.objects.link(root)
for o in bpy.data.objects:
    if o is not root: o.parent = root
for o in bpy.data.objects:
    if o.type == 'MESH':
        tris = sum(len(p.vertices) - 2 for p in o.data.polygons)
        cs = [o.matrix_world @ v.co for v in o.data.vertices]
        print('PART', o.name, tris, [s.material.name if s.material else None for s in o.material_slots],
              'y', round(min(c.y for c in cs), 4), round(max(c.y for c in cs), 4), 'z', round(min(c.z for c in cs), 4), round(max(c.z for c in cs), 4))
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_apply=True)
print('EXPORTED', out)
