# Real capture plans

Serve the copied product root (containing app/) on port 4403, or replace each plan's origin with the current
app URL. From the skill/work root use the skill-specific gate, which runs the copied house centring script
before the capture script and saves logs under plans/checks/:

```bash
node reference/capture-plan.mjs reference/plans/phone.json reference/assets/screens
```

For a user project replace `reference/` with `mockups-work/`. Every regeneration uses the same gate.
If centring finds a known native defect, read the saved log, then write a reviewed file of this shape:

```json
{
  "plan": "mockups-work/plans/phone.json",
  "logSha256": "the exact logSha256 from plans/checks/phone-capture.json",
  "reason": "Why these native findings are retained without restyling the product",
  "findings": ["Each actual finding copied/described from the retained log"]
}
```

Rerun with `--known-centring reviewed.json`. Only that exact completed findings log is accepted; an error,
missing summary, changed log or mismatched plan stops production capture. Carry retained findings into REVIEW.
Do not suppress nonzero exits with `|| true`. No production captures were made during the round-2 repair.
Do not inject CSS or substitute screen pixels. PRODUCT.md records the states and sample facts.
