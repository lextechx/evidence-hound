# Data architecture and privacy

The user-facing commitments live at [`content/data.md`](../content/data.md) and render at `/data/` on the site. This
document is the engineering side: how the split is actually enforced.

## The decision

Two kinds of data, treated in opposite ways.

| | Evidence data | User data |
| --- | --- | --- |
| What | Interventions, grades, citations, monitoring domains | Dog profiles, review history, bloodwork values |
| Lives in | `data/` in this repo | Firestore, once accounts exist |
| Licensed | CC BY-SA 4.0, public forever | Not licensed to anyone, belongs to the owner |
| Published | Mirrored publicly, plus `/data.json` on the site | Never |
| Auditable by | Anyone | The account holder |

The application code sits in the middle and is private, because that is the product.

## Keeping the evidence public when the repo is private

This is the part the private repo decision breaks if nobody handles it. Making `lextechx/evidence-hound` private removes
public access to `data/`, which contradicts the promise on `/data/` and the CC BY-SA licensing.

Two mechanisms keep that promise, and both need to work before the repo flips:

**1. `data.json` on the site.** Every build writes the complete dataset to `dist/data.json` and Firebase serves it with
`Access-Control-Allow-Origin: *`. This is the primary public interface and it survives the repo going private, because
it is published output rather than source.

**2. A public mirror repo.** `.github/workflows/mirror-data.yml` pushes `data/`, the schema, `LICENSE-CONTENT.md`, and
the methodology docs to a separate public repository on every change to `main`. That preserves the ability to file a
pull request against a grade, which is the thing that makes the evidence trustworthy. Corrections arrive on the mirror
and get pulled back into the private repo.

Without the mirror, "corrections are a pull request" stops being true and the openness is cosmetic.

## Before collection ships

Do not turn on data collection until all of these exist. This is not a nice-to-have list.

- [ ] `/data/` upgraded from commitments to a real privacy policy: named subprocessors, retention periods, legal basis
      for processing, and a contact route for data requests
- [ ] Terms of service, including an explicit "this is not veterinary advice" limitation
- [ ] Working export: full user data as JSON, self-service, no support ticket
- [ ] Working deletion: including from backups within a stated window
- [ ] Firestore security rules that deny cross-account reads by default, with tests
- [ ] Authentication that is not homegrown (Firebase Auth)
- [ ] Encryption at rest confirmed, and access to production data logged
- [ ] Decide whether under-16 or EU users are in scope, since that changes obligations materially
- [ ] Research consent kept separate from signup consent, opt-in, and revocable
- [ ] Replace the long-lived CI service account key with Workload Identity Federation

Health data about a pet is not regulated the way human health data is, but the owner's identity, location, and payment
details attached to it very much are. Treat the whole record as sensitive.

## Sketch of the Firestore model

Not built yet. Recorded so the shape is agreed before anyone writes it.

```
users/{uid}
  email, created_at, research_consent: { granted: bool, at: timestamp, version: string }

users/{uid}/dogs/{dogId}
  name, breed, sex, birth_date

users/{uid}/dogs/{dogId}/reviews/{reviewId}
  date, weight_kg, domains: { <domainId>: { score, value, measured, notes, flags[] } }
  medications[]
```

Two properties worth preserving:

The review document mirrors the offline profile format exactly, so export produces a file the local CLI can already
read. Export should not be a lossy summary.

Research consent is versioned. If the consent text changes, prior consent does not silently carry over to new terms.

## What stays out of Firestore

Evidence data. The grades and citations are static content that ships with the build. Putting them in a database would
mean grades could change without a commit, and the entire credibility argument rests on grade changes being visible in
version history.
