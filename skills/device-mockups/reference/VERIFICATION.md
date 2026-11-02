# Package verification · 1 November 2026

**Historical baseline.** The round-2 repair (2 November) changes T2's slot order and package checks.
Before the promotion, L1/L2/T1-line retained their pixels; the original `verification/` records below
describe that historical package only.
Current generated reports are in `out/`. On 2 November the founder selected L2's no-actions treatment;
the promotion checks below supersede the old L2 hierarchy. The first Larchly run failed the image gate. See PROOF.md for current proof status.

All four device-mockups looks pass from this skill and from a separate temporary copy outside the repository,
with dependencies installed in that copy. The two sets of exported PNG hashes match. No parent-folder files
or external asset requests are needed. These are reference-package checks; no second-company proof was run.

- Every look: `--check --check-fresh --stress`, default/long/short words, no stress failures.
- Every look: same pixels in reversed mixed look/size order; source pixels match its exported PNG.
- All exact-size PNGs are opaque RGB; review copies are 360×203 wide or 360×640 tall.
- All four exports match the founder-approved artwork pixel for pixel, including the chosen defaults.
- `npm run sync` completed; `node tools/sync-skills.mjs --check` passes. Shared device files are unchanged copies.
- The head-to-head case/mount is prepared; `bash -n tools/head-to-head/run.sh` passes. It was not executed.

Reproduce:

```bash
npm install
node reference/render-mockups.mjs --check --check-fresh --stress
node reference/check-mockups.mjs
```

Records in `verification/`: summary, export hashes, current/isolated package audits and approved pixel hashes.
Full PNGs, stress sheets and the 360 px/full-size review page are generated in `out/`.
The full-size, phone-width and longest-word images were inspected during packaging; the original approved
compositions, materials, screens and captions are preserved. This does not add a new independent aesthetic
score or an unattended proof level. See PROOF.md for the next company's eligibility.

## Selected-default promotion · 2 November 2026

The founder's decision 104.2 is now the code/product/values default, including bare browser rendering.
The old text hierarchies and proposal inputs are removed; the check rejects the old hierarchy names.
Both packaged render commands passed `--check --check-fresh --stress` for all four looks, followed by
`check-mockups.mjs`. This covers mixed order, local-only resources, exact dimensions, opaque
exports and equality with current source pixels, as well as the package's proof/placement checks.

`verification/promotion-2026-11-02.json` records current exports and selection hashes. Every changed default
original/360, every stress sheet, changed long/short stress frames at full/360, and true 2× crops were opened
in this informed inspection. No independent reading score or second-company pass is claimed.

L2 matches the selected no-actions review PNG and 360 copy byte for byte. L1, T1-line and T2 are
byte-identical across all 27 output PNGs, including poster and stress files. The original T1-line headline
budget remains 40 characters; only L2 gets the shorter 26-character budget. T2 rear-input visibility and
the new run’s distinct-state/fresh-reader gates remain mandatory.
