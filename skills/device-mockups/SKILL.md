---
name: device-mockups
description: >-
  Device mockups from your product's real screens: photoreal laptop and phone stills on a pale studio ground, with an
  optional headline. Editable HTML and PNGs, wide and tall. Use for device mockups, iPhone or MacBook mockups, website
  hero images, screenshots in devices or social product images.
---

# Device mockups

**If several skills could do this:** when the request doesn't name this skill and your agent also has other omnigami skills that make the same kind of thing (other launch films, shots, decks or mockups), list them by name and ask which one the user wants before you start. If it's named, or it's the only one installed, go ahead.

Make still images of the user's product on photoreal hardware, using its own screens, words and brand.
Read `style.md` before planning and `critique.md` before judging. Adapt `reference/`; keep a copy beside the
working version for comparison. Ostlery is a fictional company made for omnigami's examples, with sample data.

## Start or resume

Inspect the product's repo, app, brand files and any existing work before asking. Collect the reachable app or
sample account; the supported platforms; the real states to show; the logo/icon if wanted; the ground, ink and
accent; licensed fonts; the requested looks and sizes; and the product's own short line when using a text look.
Ask once for anything missing. In an unattended run, decide from the available evidence and record assumptions.
Check Node 20.11+, Chrome with working WebGL (`scripts/chrome.mjs`, `CHROME_PATH` overrides), ffmpeg and
`puppeteer-core`. No paid API, model download or image-generation account is needed to render the included poses.
If `mockups-work/` exists, read its product note, plan and checks and revise it instead of starting over.

Set up outside the installed skill (`SKILL_DIR` is this file's directory):

```bash
mkdir device-mockups-work && cd device-mockups-work
cp -R "$SKILL_DIR/reference" reference
cp -R "$SKILL_DIR/reference" mockups-work
cp -R "$SKILL_DIR/scripts" scripts
cp "$SKILL_DIR/LICENSE.md" LICENSE.md
npm init -y
npm install -D puppeteer-core
```

## 1. Read the product, plan the stills

Reconnaissance may include disposable survey screenshots to learn the product; label those as surveys, never
as production captures. Before the first production capture, write `mockups-work/PRODUCT.md`: what the product
does, its tokens, licensed fonts, supported platforms and one row per real state (route/actions, account,
visible result, and what has not happened yet).
Write `mockups-work/STORY.md`: one row per look, its shape, screen(s), outside-screen words and what must remain
visible at 360 px. Name the **primary detail** and the **expendable detail** for each desktop capture before
choosing its viewport/scroll state; a phone may cover only the expendable detail. A desktop product needs a
genuine phone layout before a phone joins it. If it supports only one platform, use only that hardware.

T2 requires an actual action and two visibly different native states: **the result in the front/right phone,
its earlier state behind/left**. Their change must read at 360 px without explanation. Two similar lists with
one small status/button changed are insufficient. Plan the visible evidence of the transition, then test the
composed 360 px image with a fresh reader: they must name what changed **before** seeing notes, originals or
the reference. Save their first words and context/disclosures. If the product has no such genuine pair, skip
T2, remove it from `looks.json`, and say why in STORY and REVIEW. Neither copy nor an explanation repairs an
unclear pair. An unattended run without an independent reader records this gate as unverified, never passed.

The included looks are **L1, L2, T1-line and T2**. Wide looks export **1920 × 1080**; tall looks export **1080 × 1920**.
They are composed separately. Also deliver **360 × 203** wide / **360 × 640** tall review copies.
These are the approved export sizes. Other sizes need their own composition and review, not a crop or stretch.
**L2 defaults to `no-actions`:** one short product line and one short sentence, placed close to the devices.
No pictured buttons or action fields belong in this still. Use the product's own words within 26 characters
per field. Headline starts at 84 px; both fields enforce a 64 px fitted floor at 1920 (= **12 px at 360**).
Shorten words instead of shrinking below it. A fresh reader must still read both lines unprompted at 360;
font size alone is not proof of reading. The reference uses “Small stays that fit.”
Show the plan before capturing, unless the user requested unattended work.

## 2. Capture the product's real screens

Adapt the JSON capture plans in `mockups-work/plans/`: change the URL, selectors and real actions for the user's
app. Serve the app locally or use the sample account, then run the copied house scripts for each plan:

```bash
node mockups-work/capture-plan.mjs mockups-work/plans/phone.json mockups-work/assets/screens
```

Phone viewport **440 × 897 at 3×** gives **1320 × 2691** app pixels. The renderer adds fixed sample system chrome;
the capture must be app-only, without a second status bar. Use a real app-supported device mode, not injected CSS.
The gate requires nonempty PRODUCT/STORY notes and hashes them before running the copied `scripts/centring.mjs`
**before** `screens.mjs` on each production plan and each regeneration, saving notes hashes and the exact
log/exit under `plans/checks/`. Unexpected execution errors stop capture.
For known native centring findings, read and retain the log first; keep the UI unchanged, record the exact
plan, log SHA-256, reason and each finding in a JSON file, then pass `--known-centring <file>`. The gate checks
that exact log and a completed findings summary; changed findings or a tool failure stop it. Never use
`|| true` or suppress nonzero exits in a regeneration command. Retained findings remain open in the critique.

Desktop viewport **1440 × 900 at 2×** gives **2880 × 1800** pixels. The renderer rejects wrong dimensions: recapture,
never stretch. Wait for fonts, images and the app's own settled state. Use native navigation and scroll, sample
data and whole real screens. Open **each production original at native/full detail**, not a half-size
derivative or contact sheet; record each filename/read in `out/inspection.md`. Check top/bottom boundaries,
scroll position, key labels, result figures and action visibility. Use a different real viewport/scroll state
if required evidence clips or falls offscreen. Never paint, relabel or redraw UI in the still.
A missing responsive layout is a product gap to report, not permission to invent one.

## 3. Set the product inputs and render

In `mockups-work/product.js`, replace every Ostlery input: screen paths, name, words, colours, fonts and optional
art. Screen keys are renderer slots, not instructions to keep the sample product. Every path must stay inside
`mockups-work/`. Copy the user's font files with their licences and name them in `fonts`, `display` and `ui`.
Set `displayWeight` to the weight the brand uses for its display headings (its brand guide or site CSS);
left out, the headline is set at 400, which suits a display face drawn for it but looks thin in a text face.
All outside-screen words live in `text` and `template.fields`; labels in captured UI stay the product's.
Keep the renderer, device models, `devices.js`, `vendor/` and their licence notices.

The tall input/result pair uses `ostRequest` for the earlier state in the larger rear phone and `ostResult`
for the result in the smaller front phone. `ostPhone` is the single/detail phone; `lap` is the desktop state. Those keys remain stable
when the product changes. Ground, ink, muted and rule colours come from the product.

Protect the named primary desktop detail through `product.js` (or look-specific values), in original capture
pixels: `desktopProtection: [{name: 'selection values', rect: [2300, 300, 580, 1450]}]`. Replace the example with
measured bounds from this product. `phoneSide: 'auto'` tries right, then left with limited lateral adjustment;
`'right'` or `'left'` restricts it. The renderer projects these regions through the laptop screen UVs and camera,
requires clearance from the phone hardware with a 4 px export margin, and keeps real scale, common baseline,
and whole hardware. It fails if no candidate fits. Check the visible composition too; never move native UI.

```bash
node mockups-work/render-mockups.mjs --check --check-fresh --stress
node mockups-work/check-mockups.mjs
```

`render-mockups.mjs` exports every look in `looks.json`, plus phone-width copies, hashes, logs and a review page
under `mockups-work/out/`. `--look <ID>` selects one look; `--out <folder>` chooses another output folder.
It uses only this working folder and the copied `scripts/`. Render only the looks the actual product supports;
remove unsupported rows from the plan and `looks.json`, and explain why. Never invent a second platform.
Remove unused screen slots from `product.js` too (for example `ostRequest`/`ostResult` when T2 is skipped),
so the run never retains Ostlery screens as substitutes for unsupported product states.
L2's no-actions treatment is automatic, including a direct browser render. Set `text.headline` and
`text.description` in product.js; optional `--look L2 --values <JSON>` overrides those same two fields for a
revision. The removed button hierarchies are unsupported.

## 4. Check and export

Render the **retained reference** with its own `render-mockups.mjs` first; reading its source is not viewing it.
Open each reference original and 360 px file, each final original and 360 px file, **every** default/long/short
stress sheet, and actual **2× enlarged crops** of metal edges and ground contact for every look. An unscaled
crop is not a 2× inspection. Record each path, dimensions, crop source rectangle/scale and observation in
`out/inspection.md`; keep a pending-read list. Never claim a read from generation alone. Compare matched
reference/final looks at exactly 360 CSS px and native size, with no browser fit-to-window scaling for the read.
Read every check report. Score every look with `critique.md`; fix the worst three and repeat until each is 8+.
Before a revision, write `fault | score affected | fix | qualities to preserve | files to recheck`; afterwards
reread that look's **whole revised original and 360**, its stress sheets and 2× crops, plus any affected looks.
Checks cover repeat/fresh pixels, stress text, all chosen looks in mixed order, local-only requests, opaque
canvases and complete exports. They cannot judge claims inside UI or whether the product state tells its story.
Never loosen a check. Record evidence, remaining limitations and assumptions in `out/REVIEW.md`. Separate
**app truth**, **proof actually visible in the PNG**, and **review actually executed**. A fourth approval that
exists only below the capture cannot support “four approvals shown.” Carry every open defect into its affected
score; a blocker stays below 8/HOLD even when the checks pass. Do not turn an explanation into a claimed fix.

The editable HTML loads only local files and draws deterministically: CPU-backed 2D canvases, `ctx.reset()` at
each seek, warmed first image draws, fixed seeded grain, 2× live WebGL hardware copied with
`readPixels → putImageData` then downsampled on CPU. No `drawImage(webglCanvas)`, clock, timer, network or
unseeded randomness in seek. Change shared device machinery at its source; do not fork the copied `devices.js`.

## Finish

Give the user the full PNGs, phone-width review, editable working folder, PRODUCT/STORY notes, regeneration
command and final review. Include the model attribution in the delivered editable folder and accompanying
`CREDITS.md` with the exported images; preserve font licences and any hand source record. Say what was assumed.
