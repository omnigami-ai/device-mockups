# iPhone 16 Pro Max source

The `iphone-16-pro-max` device model is derived from **iPhone 16 Pro Max** by **MajdyModels** (@MG990) on Sketchfab,
licensed **CC Attribution 4.0**.

- Source page: <https://sketchfab.com/3d-models/iphone-16-pro-max-41a071ae12794b668502f58d1e0fd1a3>
- Author: MajdyModels (<https://sketchfab.com/MG990>)
- License: Creative Commons Attribution 4.0 International, <https://creativecommons.org/licenses/by/4.0/>
- Downloaded by the founder from Sketchfab (glTF) on 2026-10-21.

Credit, wherever the model is shared: This work is based on "iPhone 16 Pro Max"
(https://sketchfab.com/3d-models/iphone-16-pro-max-41a071ae12794b668502f58d1e0fd1a3) by MajdyModels
(https://sketchfab.com/MG990) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Modified for
omnigami.

Changes (Blender 5.2, `prepare-phone.py` beside this file): node transforms baked; the Apple mark on the back given the back's own material (flush, no mark);
the screen's wallpaper image dropped (the screen gets a plain material, replaced by the product's capture in the film);
the screen and its cover glass named `SCREEN` and `GLASS`; turned so the screen faces glTF +Z, upright. Apple product
names describe the device shape only; no Apple mark, wallpaper or screen ships.

Shipped as `iphone-16-pro-max.gltf` with `iphone-16-pro-max.bin` and its textures (`iphone-16-pro-max-<n>.png|jpg`), split byte for byte from the exported
.glb by `tools/split-glb.py` (2026-11-05) so no file passes the 5 MiB limit of Anthropic's plugin directory. After a
new export, split again and delete the .glb.
