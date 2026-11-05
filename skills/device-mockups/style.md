# Device mockups: style

A pale studio ground, neutral broad light, satin metal and true black bezels. The product's own light UI is
unobstructed. No wallpaper, extra platform or invented control is needed to fill the frame.

| Look | Shape | Composition and product input |
| --- | --- | --- |
| L1 | Wide | Frontal laptop leads, complementary phone overlaps the right edge; common physical baseline. Real desktop and phone layouts required. |
| L2 | Wide | Short product line and sentence close above the same devices; no pictured buttons. All outside words at least 12 px at 360. |
| T1-line | Tall | One complete slightly turned phone below the product line; generous margins, soft underside contact. |
| T2 | Tall | Earlier input behind-left, actual result lower-right in front at about 0.85 apparent scale; roughly a quarter-width overlap. Visibly distinct states, with the key result exposed. Skip when no real pair reads without explanation at 360. |

Wide devices use about 86% of the frame's width for L1, 90% with a 55%-height device block for L2. A long
perspective lens around 12°, camera level with the keyboard deck and a lens shift keep the lid square and the
keyboard edge-on. Avoid orthographic flattening and short-lens distortion. Phone height is about 0.48 of the
15-inch laptop width; move it nearer if needed, never make it a giant device. Tall uses about 14° perspective,
subtle yaw (about 3–6°), pitch 1–2° and almost no roll. T1-line's phone fills about 70% of the limiting frame
side; T2's group about 91%. Preserve the whole devices and result labels.

Satin aluminium starts near #B9BCC0, roughness 0.46, environment 0.45; above/front lighting reveals the thumb
notch. No cover glass over clean screens; it greys the bezel and creates a false camera dot. Hide the camera's
reflective overlays. Draw CAMERA_GLASS last if retained. Use exact vertex boxes for grounding. Contact is
projected from the actual low mesh; retain the dedicated laptop underside and foot layers. No hard offset
shadow, floating base, shiny chrome or floor reflection.

Use the product's own display face, at the weight its brand sets display headings (`displayWeight`), and one short
line above a tall phone. L2 uses the selected `no-actions`
treatment: headline baseline 194 px, sentence baseline 278 px, unchanged device block below. Its headline
starts at 84 px, sentence at 64 px, both within 88% of the width, with a 64 px fitted floor (12 px at 360).
Keep both fields within 26 characters and shorten words rather than shrink below that floor. No buttons,
action labels or alternate hierarchy. Fit uniformly with natural glyph proportions.
Do not add badges or a hand to this family. Phone-only products use the tall looks; desktop-only products need
a separately reviewed laptop composition, not a pretend mobile capture.

## Transfer and capture rules

All device screens are the working product's native pixels. Preserve aspect ratio, real labels, coherent sample
data and truthful state ordering. Name primary and expendable desktop detail before capture. Protect the primary
capture-pixel rectangles through `desktopProtection`; adapt phone placement, not native UI. Inspect capture
boundaries so the proof is actually present. T2's real input/result action must be apparent without notes to a
fresh reader of the 360 px image, with result in front. No UI is drawn for the still. At 360 px category/result reads through
its large form; dense UI copy is not promised readable at thumbnail size. Choose a closer state if that matters.
Use separate wide and tall compositions; no auto-cropping. A repeat of a state in alternative looks is intentional
for a still set. The package has only laptop and phone models; no unapproved tablet, watch or other hardware.

Hardware is rendered at 2× then copied through readPixels into CPU-backed helper canvases and downsampled.
Every helper uses willReadFrequently, the frame resets each seek, and every scaled asset is warmed in prepare.
The shared device module and vendored Three.js remain local, with their model and font licence notices.
