# Device mockups: critique

Judge every exported look beside the reference at **360 px**, full size and 2× around device edges,
contact and any hand. Automatic checks supplement the review; they cannot read claims inside a capture.
Record `look | dimensions | each score | evidence | fix` in `out/REVIEW.md`. Every line needs **8 or above**.
Open defects must lower the affected score; unresolved blockers are **below 8 / HOLD** regardless of automatic
passes. A disclosed compromise is still a defect. Mark missing review evidence unverified, not passed.

1. **Product and truth.** Genuine supported platforms and real states. Someone at 360 px can identify the product's
   category and primary result. Sample data only; no claim of a completed action when it is merely available.
   T2's result is in front and earlier state behind; a fresh reader must name their visible change at 360
   **before reading notes, originals or reference**. Save their first interpretation/context. Reject nearly
   identical states and changes that need explanation; skip T2 with a reason if no real pair works. No fresh
   reader means this gate is unverified. Do not claim counts, approvals or figures outside the image.
2. **Native screen.** Correct aspect and colours, no stretched or redrawn UI, doubled status bar, loading image,
   clipped key label, hidden result or lower fade that erases the proof. Related states agree on facts. Check
   each production capture's native top/bottom boundaries; choose real viewport/scroll states to keep proof.
3. **Composition.** Each shape independently composed; hierarchy and overlap protect the key screen. Balanced
   margins, physical scale and plausible common baseline. Check STORY's named primary/expendable desktop
   detail against the measured `desktopProtection` rectangles. No empty platform used as decoration.
4. **Material and light.** Photographic satin metal, true black bezel, clean smooth edges at 2×. Light has a cause;
   no painted rim, hard offset shadow, floating base, grey cover glass, camera dot or distorted lid.
5. **Words.** Product's own line, balanced and readable at 360 px, whole glyphs, no squeezing, overflow or text
   collision. A reader reads **both outside-screen lines unprompted at 360**, before seeing the original.
   L2 has no pictured buttons or action fields. Measure final fitted size × 360/export width: both L2 fields
   must be at least **12 px**. Use the product's short line and sentence, each within 26 characters; the
   numeric floor does not replace the actual read. The no-actions hierarchy is the default. The headline is in the
   brand's display weight (`displayWeight`), never thinner than the sentence under it looks.
6. **Delivery.** Every planned look has its exact-size opaque PNG, review copy and editable local source; commands,
   hashes and review are included. Model, font and hand notices accompany the delivery. No network dependencies.

## Light checks on purpose

- L1/L2: keyboard unseen, lid square, phone on the same surface at real scale. Laptop underside and feet contact
  are plainly visible; no floating gap. T1-line: whole phone and short line. T2: earlier input behind-left,
  result smaller and forward-right, visibly different with its primary name/figure exposed. Nothing from the
  dark family enters these images.

## Evidence required before scoring

- PRODUCT/STORY exist before production capture; exploratory surveys are labelled separately. Each production
  plan and regeneration has a preceding centring log/exit; known native findings have an exact-log reasoned
  record, while execution errors stop capture. No blanket `|| true`.
- In `out/inspection.md`, one row per **production original**, **matched rendered reference original/360**,
  **final original/360**, and **each default/long/short stress sheet**. Record the actual read and observation;
  a generated file is not a viewed file. All twelve stress sheets are required for four looks.
- Every look has saved/read **2× enlarged** edge and contact crops, with source rectangle, native crop size,
  output dimensions and scale. Ordinary 1× crops do not count. No hand belongs in this family.
- Before each fix: defect, affected score, planned repair, qualities to preserve, files to reread. After: whole
  changed-look original/360, its stress sheets/crops and affected looks reread. Keep unresolved defects visible.
- Separate what the app does, what the PNG visibly proves, and which inspections were executed. A note cannot
  prove a hidden figure or repair the image. Final scores and summary claims must match that evidence.
- A fresh reader gets only unnamed 360 px images first, no story/captions/reference. Record their first words
  and inherited context; a reader who already knows the story cannot provide the blind interpretation.

## Automatic checks

```bash
node reference/render-mockups.mjs --check --check-fresh --stress
node reference/check-mockups.mjs
```

The first runs the bundled house renderer for every manifest look, checks repeatability and first renders,
stresses all text fields, exports PNGs and review copies and writes hashes/logs. Inspect every stress sheet.
The second checks mixed look/size order, all files local, opaque frames, export dimensions and hand protection
where applicable. A check must fail on error; do not loosen it to pass. Visual scores still need human judgment.
For each revision, say what must stay unchanged and inspect those looks again. If a fault survives two fixes,
report it with evidence before attempting a third. A second-company proof is a fresh unattended skill run, never
an adaptation manually built by the reference's author.
