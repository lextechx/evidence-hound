# Evidence Hound 🐕

**What actually works for aging dogs — graded by the strength of the randomized trial evidence behind it.**

Owners of aging dogs make real medical decisions under time pressure, usually by searching the internet between vet
visits. What they find is dominated by supplement marketing and forum anecdote, where a manufacturer's press release and
a placebo-controlled trial are presented as the same kind of information. The actual trial literature is scattered across
paywalled journals.

This project puts that evidence in one place, states plainly how strong it is, and shows its work.

- Every claim lives in a JSON file with its citations attached
- Every intervention gets a grade from **A** (strong) to **D** (evidence of little or no benefit)
- Interventions that *failed* their trials stay visible — grade D exists on purpose
- Industry funding is disclosed on every study, and sponsor-funded results without independent replication cap at B
- Code is MIT, content is CC BY-SA 4.0, and the full dataset publishes as a single `data.json`

> [!IMPORTANT]
> This is not veterinary advice. It summarizes published research about dogs in general and cannot know your dog. Every
> decision belongs to you and your veterinarian.

## What's in it today

Ten interventions across four conditions, seeded from the current literature:

| Grade | Intervention | Condition |
| --- | --- | --- |
| A | Veterinary NSAIDs (carprofen, meloxicam, firocoxib, robenacoxib) | Osteoarthritis |
| B | Bedinvetmab / Librela (anti-NGF antibody) | Osteoarthritis |
| B | Grapiprant / Galliprant | Osteoarthritis |
| B | Omega-3 fatty acids (EPA/DHA diets) | Osteoarthritis |
| B | Weight optimization | Osteoarthritis |
| B | MCT-enriched diet | Cognitive dysfunction |
| C | Selegiline / Anipryl | Cognitive dysfunction |
| U | Rapamycin (TRIAD trial ongoing) | Healthspan |
| U | LOY-002 (pre-approval) | Healthspan |
| D | Glucosamine and chondroitin | Osteoarthritis |

That last row is the reason this project exists. Glucosamine and chondroitin are the most recommended joint supplement
for dogs, and the 2022 systematic review and meta-analysis found a marked non-effect.

## The monitoring framework

The interventions answer "what works." The [monitoring framework](data/monitoring.json) answers "how do I track my own
dog." It's twelve domains — body condition, mobility and pain, cognition, thirst and urination, bloodwork,
cardiorespiratory, oral health, masses, senses, medication review, quality of life, and activity — each with what to
measure, which validated instrument to use, how often, and what should trigger a call to the vet.

Record reviews in a JSON profile and generate a dated report to hand to your veterinarian:

```bash
node scripts/report.mjs examples/dog-profile.example.json --out report.md
```

The report leads with red flags, then what changed since the last review, then — importantly — the domains you *didn't*
assess, listed explicitly so an unmeasured domain is never mistaken for a normal one. It closes with a generated list of
questions for the appointment. Profiles stay on your machine; nothing is uploaded.

Each domain declares whether a rising number is good or bad, so trends read correctly whether the instrument is a pain
score (up is worse) or weekly walk minutes (up is better).

One honest caveat, stated on the page itself: the individual instruments are validated, but the framework as a whole has
never been tested in a randomized trial. No canine monitoring protocol has. It's a reasonable synthesis of established
geriatric practice, and it's labeled as that rather than dressed up as something stronger.

## Running it locally

Node 20 or newer. There are no dependencies to install.

```bash
npm run check
```

That validates the data, builds the site, and runs the tests. To preview:

```bash
npm run build && npm run serve
```

Then open http://localhost:4173.

## How it's built

```
data/
  conditions.json              the four condition definitions
  interventions/*.json         one file per intervention — this is the actual content
  schema/intervention.schema.json
scripts/
  schema.mjs                   ~90-line JSON Schema validator, no dependencies
  validate.mjs                 schema + cross-reference checks; the CI gate
  data.test.mjs                tests that enforce grading discipline
  serve.mjs                    preview server
src/
  build.mjs                    static site generator
  render.mjs                   HTML templates
  site.css
```

There is no CMS, no database, and no dependency tree to audit. The site is generated from the JSON files by a
dependency-free Node script, and the content and the code are the same repository.

That structure is deliberate: a veterinarian who disagrees with a grade can open a pull request changing one field and
stating why, and the disagreement becomes part of the public record instead of an argument in a comment section.

Some tests enforce editorial rules rather than code correctness — for example, a grade U ("untested") entry that cites a
completed randomized trial fails the build, because it should have been regraded.

## Contributing

Corrections, new interventions, and challenges to existing grades are all welcome, especially from veterinarians and
researchers. If we have misread a trial, that's the most valuable contribution you can make. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licenses

- **Code** — [MIT](LICENSE)
- **Content and data** — [CC BY-SA 4.0](LICENSE-CONTENT.md), so it can be reused and translated as long as it stays open

## What this project will not do

- Tell you what to give your dog
- Take affiliate revenue or product sponsorship — a site that earns money per supplement click cannot be trusted to
  grade supplements
- Hide negative findings
- Treat regulatory approval as proof of effectiveness, or its absence as proof of uselessness
