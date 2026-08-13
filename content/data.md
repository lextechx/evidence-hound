# How we handle data

There are two completely different kinds of data in this project, and keeping them separate is the whole design.

## The evidence is open. Permanently.

Every intervention, grade, citation, and monitoring domain on this site is published as open data under CC BY-SA 4.0. You
can download the whole thing as a single file, reuse it, translate it, or build something else on top of it. You can read
the reasoning behind every grade and disagree with it in public.

This part is not a product and will never be locked up. The reason is simple: an evidence resource nobody can audit is
just a blog with confident opinions. If you cannot check our work, you have no reason to believe our grades, and you
should not.

The ShareAlike term exists so that nobody can take this dataset, quietly delete the grade D entries that say their
product does not work, and sell the result.

## Your dog's record is private. Also permanently.

The monitoring tool is different. A record of your dog's weight, pain scores, bloodwork, and cognitive decline is
health information about a family member, and some of it is information about you too: where you live, what you can
afford, how often you go to the vet.

If you use the command-line report generator today, none of that leaves your computer. There is no account, no server,
and nothing to upload.

A hosted version with saved profiles is planned, because keeping a JSON file by hand is a real barrier and most people
who need this are not going to do it. That version will store your dog's record on our servers. When it ships, these
commitments come with it:

When it ships, you will be able to export everything about your dog as JSON in the same format the offline tool uses,
on demand and without asking anyone. Deletion will mean deleted, including from backups within a defined window, rather
than hidden from your view while we keep a copy.

The record will not be sold. Not to advertisers, not to pet insurers, not to pet food or pharmaceutical companies. There
is no advertising here and no affiliate revenue, which is the same reason you can trust the grades. There is no
third-party tracking, no advertising pixels, and no session recording.

Nothing will be used for research unless you specifically agree to it, which is worth explaining properly.

## The research question, stated honestly

Aggregated monitoring data across thousands of aging dogs would be genuinely valuable. It is close to what the Dog Aging
Project has been building, and it could answer questions no drug company will ever fund: which early signals actually
predict decline, whether the interventions on this site perform in ordinary homes the way they did in trials, what
normal aging looks like across breeds.

We would like to do that eventually. We are telling you now rather than burying it in a terms update later.

If it happens, it happens on these terms: separate, specific, opt-in consent, not a checkbox bundled into signup and not
a pre-ticked box. Contributed data is stripped of identifying detail. You can withdraw. Declining costs you nothing, and
every feature works exactly the same either way. And if the research produces findings, those findings come back here as
open evidence, graded by the same rules as everything else.

## What is not decided yet

This page describes commitments, not a shipped system. Accounts do not exist yet. When they do, this page becomes a real
privacy policy with specifics: named subprocessors, retention periods, the legal basis for processing, and a contact for
data requests.

If any of the commitments above ever get weakened, that change will be visible in the repository history, because this
page is a file in the same open repository as the evidence.

## Not a medical record

One practical note. This is a tracking tool for owners, not a veterinary medical record. Your veterinarian's records are
the authoritative ones. Bring the report to appointments as a summary of what you observed at home, and expect your vet
to correct it.
