# Contributing to Evidence Hound

The most valuable contribution you can make is telling us we're wrong about a trial. Second most valuable is adding an
intervention that owners are spending money on and we haven't graded yet — including ones you expect to grade badly.

You do not need to be a veterinarian to contribute, but claims need citations either way.

## The one rule

**Every factual claim traces to a citation in the same file.** If you can't cite it, it doesn't go in. This applies
equally to positive and negative claims — "there is no evidence for X" needs a systematic review saying so, not an
absence of search results.

## Adding or changing an intervention

1. Fork and branch.
2. Edit or create `data/interventions/<id>.json`. The filename must match the `id` field.
3. Run `npm run check` — validation, build, and tests. It must pass; CI runs the same thing.
4. Open a pull request explaining what changed and why. If you're changing a grade, say what evidence moved it.

The schema is at [`data/schema/intervention.schema.json`](data/schema/intervention.schema.json) and most editors will
autocomplete against it. Copy an existing file as a starting point —
[`omega-3-fatty-acids.json`](data/interventions/omega-3-fatty-acids.json) is a good model because it has multiple trials
plus a meta-analysis.

### Fields that need care

- **`tier_rationale`** — explain why this grade and not the one above or below it. "Strong evidence" is not a rationale;
  "three independent blinded RCTs, capped below A because two were sponsor-funded" is.
- **`harms`** — never leave this optimistic by omission. If a safety signal is under discussion in the literature, it
  belongs here even when the regulator has not acted on it.
- **`what_trials_show`** — use the actual numbers. "Improved pain scores" is nearly useless; "43.5% treatment success
  versus 16.9% on placebo at day 28" lets a reader judge for themselves.
- **`funding`** — name who paid for each study. Industry funding is not disqualifying and most veterinary trials have it.
  It is always disclosed.
- **`last_reviewed`** — the date *you* checked the sources, not the date you edited the file.

## How grades work

| Grade | Meaning |
| --- | --- |
| **A** | Consistent benefit across multiple independent, adequately powered RCTs, or a systematic review of them |
| **B** | At least one adequately powered, randomized, blinded controlled trial showing clinically meaningful benefit |
| **C** | Controlled trials exist but are small, unblinded, short, inconsistent, or use surrogate outcomes |
| **U** | No completed RCT in the target population — unknown, not disproven |
| **D** | Adequately powered trials or pooled analyses found no clinically meaningful effect |

Two rules the test suite enforces automatically:

- An intervention graded A or B must cite at least one RCT, meta-analysis, or systematic review.
- An intervention graded U must not cite a completed RCT. If a trial has reported, regrade it.

A third rule is editorial rather than automated: **sponsor-funded evidence without independent replication caps at B.**

## Grading disagreements

If you think a grade is wrong, open an issue or a PR with the reasoning. Disagreement between qualified people about
where evidence sits is normal and the repository is a good place to have it, because the argument stays attached to the
data. What we won't do is split the difference to avoid a conflict — the grade should reflect the evidence, and if the
evidence is genuinely contested, `tier_rationale` should say so explicitly.

## Style

Write for a worried owner reading at 11pm, not for a journal. Complete sentences, no jargon that isn't defined in place,
numbers where numbers exist. Assume the reader is smart and frightened and has limited money.

Avoid hedging that conveys nothing ("may potentially help some dogs"). If the effect is modest, say it's modest and give
the number.

## What doesn't belong

- Product recommendations, affiliate links, or brand promotion
- Dosing instructions specific enough to be acted on without a veterinarian
- Anecdote, testimonial, or case reports presented as evidence
- Human trial data presented as if it applies to dogs — cite it as context, label it as such

## Code changes

The build is dependency-free by design and we'd like to keep it that way. A PR adding a package needs to argue why the
capability is worth the supply-chain surface. Formatting: 2-space indent, double quotes, semicolons.

## Code of conduct

Be decent. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
