# Prepare "iPhone 16 Pro Max" by MajdyModels (CC BY 4.0) for omnigami's device film: bake transforms, cover the Apple
# mark in the back's material, drop the wallpaper image, name the screen and its cover glass for the device contract, turn it so the screen
# faces glTF +Z (upright), export a GLB.
import bpy, sys, math, mathutils
src, out = sys.argv[-2], sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
for o in meshes:
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
bpy.ops.object.select_all(action='DESELECT')
for o in meshes: o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in [o for o in bpy.data.objects if o.type != 'MESH']: bpy.data.objects.remove(o)
# the Apple mark fills a cut-out in the back: deleting it leaves a hole, so it takes the back's own material instead
# (flush and the same colour, no mark)
back = bpy.data.materials['basecolor.001']
for o in list(bpy.data.objects):
    if 'apple logo' in o.name.lower() or 'apple_logo' in o.name.lower():
        o.data.materials.clear(); o.data.materials.append(back); o.name = 'BACK_PLATE'; print('MARK REPAINTED', o.name)
for o in bpy.data.objects:
    if o.name == 'Cube.014_screen.001_0':
        o.name = 'SCREEN'; o.data.name = 'SCREEN'
        m = bpy.data.materials.new('screen'); m.use_nodes = True; o.data.materials.clear(); o.data.materials.append(m)
    elif o.name == 'Cube.014_glass.002_0':
        o.name = 'GLASS'; o.data.name = 'GLASS'
for img in list(bpy.data.images):
    if 'screen' in img.name.lower(): print('DROPPED IMAGE', img.name); bpy.data.images.remove(img)
# the screen faces Blender -X (its polygon normals point inward); turn +90 degrees about Z so it faces -Y (glTF +Z), the long axis already up
R = mathutils.Matrix.Rotation(math.radians(90), 4, 'Z')
for o in bpy.data.objects: o.data.transform(R); o.data.update()
scr = bpy.data.objects['SCREEN']; n = mathutils.Vector()
for p in scr.data.polygons: n += p.normal * p.area
print('SCREEN_NORMAL', [round(x, 3) for x in n.normalized()])
root = bpy.data.objects.new('iphone-16-pro-max', None); bpy.context.collection.objects.link(root)
for o in bpy.data.objects:
    if o is not root: o.parent = root
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_yup=True, export_apply=True)
print('EXPORTED', out)
