/** HTML templates. Plain template literals, no framework, no runtime. */

export const TIERS = {
  A: {
    label: "Strong evidence",
    blurb:
      "Consistent benefit across multiple independent, adequately powered, randomized controlled trials, or a systematic review of them.",
  },
  B: {
    label: "Moderate evidence",
    blurb:
      "At least one adequately powered, randomized, blinded controlled trial showing a clinically meaningful benefit.",
  },
  C: {
    label: "Limited evidence",
    blurb:
      "Controlled trials exist but are small, unblinded, short, inconsistent, or rely on surrogate outcomes.",
  },
  U: {
    label: "Untested in dogs",
    blurb: "No completed randomized controlled trial in the target population. Unknown, not disproven.",
  },
  D: {
    label: "Evidence of little or no benefit",
    blurb:
      "Adequately powered trials or pooled analyses found no clinically meaningful effect. This is a finding, not a gap.",
  },
};

const MARK = `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M9 5 L18 19 L9.5 21 Z" fill="var(--ink)"/>
  <path d="M39 5 L30 19 L38.5 21 Z" fill="var(--ink)"/>
  <path d="M24 9 C33 9 37.5 16.5 37.5 25 C37.5 35 31.5 42 24 42 C16.5 42 10.5 35 10.5 25 C10.5 16.5 15 9 24 9 Z" fill="var(--ink)"/>
  <path d="M24 12 C26.6 19 26.6 31 24 41 C21.4 31 21.4 19 24 12 Z" fill="var(--paper)"/>
  <circle cx="17.4" cy="24" r="2.6" fill="#4aa8dd"/>
  <circle cx="30.6" cy="24" r="2.6" fill="#e0a63f"/>
  <path d="M24 32.5 L27 35.6 L24 38.6 L21 35.6 Z" fill="var(--paper)"/>
</svg>`;

const esc = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const url = (ctx, path) => `${ctx.base}${path}`;

const tierBadge = (tier) =>
  `<span class="tier tier-${esc(tier)}" title="${esc(TIERS[tier].blurb)}"><b data-grade="${esc(
    tier,
  )}"></b>${esc(TIERS[tier].label)}</span>`;

export const SITE_URL = "https://evidence-hound.web.app";

export function layout(ctx, { title, description, page, path = "/" }) {
  const fullTitle = title ? `${esc(title)} · Evidence Hound` : "Evidence Hound · What actually works for aging dogs";
  const blurb =
    description ??
    "An open, evidence-graded reference for treating aging dogs, built from randomized controlled trial data.";
  const canonical = `${SITE_URL}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${esc(blurb)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Evidence Hound">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${esc(blurb)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${esc(blurb)}">
<link rel="stylesheet" href="${url(ctx, "/site.css")}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐺</text></svg>">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="${url(ctx, "/")}">${MARK} Evidence&nbsp;Hound</a>
    <nav aria-label="Main">
      <a href="${url(ctx, "/story/")}">Why this exists</a>
      <a href="${url(ctx, "/track/")}">Track your dog</a>
      <a href="${url(ctx, "/monitoring/")}">Framework</a>
      <a href="${url(ctx, "/methods/")}">How we grade</a>
      <a href="${url(ctx, "/data/")}">Data</a>
      <a href="${url(ctx, "/about/")}">About</a>
      <a href="https://github.com/lextechx/evidence-hound">Source</a>
    </nav>
  </div>
</header>
<main id="main" class="wrap">
${page}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p class="disclaimer"><strong>This is not veterinary advice.</strong> Evidence Hound summarizes published research about
    dogs in general. It cannot know your dog. Every decision here belongs to you and your veterinarian, who can
    examine the animal in front of them. No website can do that.</p>
    <p>Code is MIT licensed. Content and data are CC BY-SA 4.0. Corrections are welcome and expected:
    <a href="https://github.com/lextechx/evidence-hound/issues">open an issue</a> or send a pull request.</p>
  </div>
</footer>
</body>
</html>
`;
}

const paragraphs = (text) =>
  String(text)
    .split(/\n{2,}/)
    .map((chunk) => `<p>${esc(chunk.trim())}</p>`)
    .join("\n");

function evidenceCard(entry) {
  const rows = [
    ["Design", entry.design],
    ["Dogs analyzed", entry.n],
    ["Blinding", entry.blinding],
    ["Control", entry.control],
    ["Duration", entry.duration],
    ["Population", entry.population],
    ["Primary outcome", entry.primary_outcome],
    ["Result", entry.result],
    ["Funding", entry.funding],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return `<article class="evidence">
  <h3>${esc(entry.citation)}</h3>
  <p class="evidence-type"><span class="pill">${esc(entry.type.replaceAll("_", " "))}</span> <span class="year">${esc(
    entry.year,
  )}</span></p>
  <p class="evidence-summary">${esc(entry.summary)}</p>
  <dl>
    ${rows.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join("\n    ")}
  </dl>
  ${entry.url ? `<p class="source"><a href="${esc(entry.url)}" rel="noopener">Read the source</a></p>` : ""}
</article>`;
}

function interventionCard(ctx, item) {
  return `<li class="card" data-tier="${esc(item.tier)}" data-conditions="${esc(item.conditions.join(" "))}">
  <div class="card-head">
    ${tierBadge(item.tier)}
    <span class="category">${esc(item.category)}</span>
  </div>
  <h3><a href="${url(ctx, `/interventions/${item.id}/`)}">${esc(item.name)}</a></h3>
  ${item.brand_names?.length ? `<p class="brands">${esc(item.brand_names.join(", "))}</p>` : ""}
  <p>${esc(item.plain_summary)}</p>
</li>`;
}

export function homePage(ctx) {
  const byCondition = Object.entries(ctx.conditions)
    .map(([id, condition]) => {
      const items = ctx.interventions.filter((i) => i.conditions.includes(id));
      if (!items.length) return "";
      return `<section class="condition-block">
  <div class="section-head">
    <h2><a href="${url(ctx, `/conditions/${id}/`)}">${esc(condition.name)}</a></h2>
    <span class="section-count">${items.length} intervention${items.length === 1 ? "" : "s"}</span>
  </div>
  <p class="lede">${esc(condition.short)}</p>
  <ul class="cards">
    ${items.map((item) => interventionCard(ctx, item)).join("\n    ")}
  </ul>
</section>`;
    })
    .join("\n");

  const graded = ctx.interventions.length;
  const trials = ctx.interventions.reduce((sum, i) => sum + i.evidence.length, 0);
  const negative = ctx.interventions.filter((i) => i.tier === "D").length;

  return `<section class="hero">
  <p class="eyebrow">Evidence-graded veterinary reference</p>
  <h1>What actually works for aging dogs</h1>
  <p class="lede">Your dog is getting older and the internet is full of confident advice. This site ranks the
  treatments by the quality of the randomized trial evidence behind them, including the popular ones that trials
  show do not work.</p>
  <p><a class="button" href="${url(ctx, "/methods/")}">How the grading works</a>
  <a class="button button-secondary" href="${url(ctx, "/track/")}">Track your own dog</a></p>
</section>

<dl class="figures">
  <div><dt>Interventions graded</dt><dd>${graded}<span class="figure-note">Across four conditions of aging</span></dd></div>
  <div><dt>Studies cited</dt><dd>${trials}<span class="figure-note">Every one linked, with its funder named</span></dd></div>
  <div><dt>Found not to work</dt><dd>${negative}<span class="figure-note">Kept visible rather than quietly dropped</span></dd></div>
  <div><dt>Cost to read</dt><dd>Free<span class="figure-note">No ads, no affiliate links, no sponsorship</span></dd></div>
</dl>

<section class="legend">
  <h2>The grades</h2>
  <ul>
    ${Object.entries(TIERS)
      .map(
        ([tier, meta]) =>
          `<li>${tierBadge(tier)}<span class="legend-blurb">${esc(meta.blurb)}</span></li>`,
      )
      .join("\n    ")}
  </ul>
</section>

${byCondition}

<section class="cta">
  <h2>Something here is wrong or out of date</h2>
  <p>Almost certainly. Evidence moves, and a page with a
  <code>last_reviewed</code> date from months ago should be read with that in mind. Every claim on this site lives in a
  JSON file with its citation attached, so a correction is a pull request, not an email to a webmaster who may or may
  not reply.</p>
  <p><a class="button" href="https://github.com/lextechx/evidence-hound/blob/main/CONTRIBUTING.md">How to contribute a correction</a></p>
</section>`;
}

export function interventionPage(ctx, item) {
  const conditionLinks = item.conditions
    .map((id) => `<a href="${url(ctx, `/conditions/${id}/`)}">${esc(ctx.conditions[id].name)}</a>`)
    .join(", ");

  const practical = item.practical
    ? `<section>
  <h2>Practical detail</h2>
  <dl class="practical">
    ${[
      ["Route", item.practical.route],
      ["Typical course", item.practical.typical_course],
      ["Monitoring", item.practical.monitoring],
      ["Cost", item.practical.cost_signal],
    ]
      .filter(([, value]) => value)
      .map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)
      .join("\n    ")}
  </dl>
</section>`
    : "";

  const regulatory = item.regulatory
    ? `<section>
  <h2>Regulatory status</h2>
  <dl class="practical">
    ${[
      ["United States", item.regulatory.us],
      ["European Union", item.regulatory.eu],
      ["United Kingdom", item.regulatory.uk],
      ["Note", item.regulatory.notes],
    ]
      .filter(([, value]) => value)
      .map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`)
      .join("\n    ")}
  </dl>
</section>`
    : "";

  const askVet = item.ask_your_vet?.length
    ? `<section class="ask">
  <h2>Questions worth asking your vet</h2>
  <ul>${item.ask_your_vet.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
</section>`
    : "";

  const seeAlso = item.see_also?.length
    ? `<section>
  <h2>See also</h2>
  <ul class="inline-list">${item.see_also
    .map((id) => {
      const target = ctx.interventions.find((i) => i.id === id);
      return target ? `<li><a href="${url(ctx, `/interventions/${id}/`)}">${esc(target.name)}</a></li>` : "";
    })
    .join("")}</ul>
</section>`
    : "";

  return `<nav class="breadcrumb"><a href="${url(ctx, "/")}">Home</a> › ${conditionLinks}</nav>

<article>
  <header class="intervention-head">
    ${tierBadge(item.tier)}
    <h1>${esc(item.name)}</h1>
    ${item.brand_names?.length ? `<p class="brands">Sold as ${esc(item.brand_names.join(", "))}</p>` : ""}
    <p class="lede">${esc(item.plain_summary)}</p>
  </header>

  <section class="rationale">
    <h2>Why this grade</h2>
    ${paragraphs(item.tier_rationale)}
  </section>

  <section>
    <h2>What the trials show</h2>
    ${paragraphs(item.what_trials_show)}
  </section>

  <section class="harms">
    <h2>Harms and cautions</h2>
    ${paragraphs(item.harms)}
  </section>

  ${practical}
  ${regulatory}
  ${askVet}

  <section>
    <h2>The evidence, one study at a time</h2>
    ${item.evidence.map(evidenceCard).join("\n    ")}
  </section>

  ${seeAlso}

  <footer class="meta">
    <p>Last reviewed ${esc(item.last_reviewed)}${
      item.contributors?.length ? ` · Reviewed by ${esc(item.contributors.join(", "))}` : ""
    } · <a href="https://github.com/lextechx/evidence-hound/blob/main/data/interventions/${esc(
      item.id,
    )}.json">View the source data</a></p>
  </footer>
</article>`;
}

export function conditionPage(ctx, id, condition, related) {
  return `<nav class="breadcrumb"><a href="${url(ctx, "/")}">Home</a> › ${esc(condition.name)}</nav>

<header class="hero">
  <h1>${esc(condition.name)}</h1>
  <p class="lede">${esc(condition.short)}</p>
</header>

${paragraphs(condition.description)}

<section>
  <h2>How it is measured</h2>
  <p>${esc(condition.measured_by)}</p>
  <p class="aside">Why this matters: canine pain and cognition trials rely heavily on owner-reported scores, and owners
  who know their dog is being treated tend to report improvement whether or not the drug works. Trials using objective
  measures such as force-plate gait analysis carry more weight here for exactly that reason.</p>
</section>

<section>
  <h2>Interventions, best evidence first</h2>
  <ul class="cards">
    ${related.map((item) => interventionCard(ctx, item)).join("\n    ")}
  </ul>
</section>`;
}

export function methodsPage(ctx) {
  return `<header class="hero">
  <h1>How we grade evidence</h1>
  <p class="lede">The grade describes how confident we can be that an intervention works. Not how new it is, how
  expensive it is, or how enthusiastically it is marketed.</p>
</header>

<section class="legend">
  <h2>The five grades</h2>
  <ul>
    ${Object.entries(TIERS)
      .map(([tier, meta]) => `<li>${tierBadge(tier)}<span class="legend-blurb">${esc(meta.blurb)}</span></li>`)
      .join("\n    ")}
  </ul>
</section>

<section>
  <h2>What we weight heavily</h2>
  <ul>
    <li><strong>Randomization and blinding.</strong> Owner-reported outcomes in canine pain trials routinely show placebo
    response rates above 15%. An unblinded trial cannot separate a working drug from a hopeful owner.</li>
    <li><strong>Objective outcomes.</strong> Force-plate gait analysis measures how much weight a dog puts on a limb. It
    does not care what anyone believes. Trials using objective endpoints get more weight than those using
    questionnaires alone.</li>
    <li><strong>Adequate power and duration.</strong> A 12-dog, 14-day study is a pilot, not an answer.</li>
    <li><strong>Independent replication.</strong> One trial is a result. Two independent trials agreeing is knowledge.</li>
  </ul>
</section>

<section>
  <h2>What we disclose but do not penalize outright</h2>
  <p>Industry funding. Most veterinary trials are manufacturer-funded, because almost nobody else pays for them. Refusing
  to cite sponsor-funded work would leave this site nearly empty. Instead, every evidence entry names its funder, and
  sponsor-funded results without independent replication are capped at grade B.</p>
</section>

<section>
  <h2>Why grade D exists</h2>
  <p>Most evidence resources quietly omit interventions that failed. That is a mistake. An owner spending money on a
  supplement every month deserves to know that the pooled analysis found no effect, and needs to hear it in the same
  place they research everything else. Grade D means trials were done and came back negative. It is a real finding and
  it is arguably the most useful information on this site.</p>
</section>

<section>
  <h2>What a grade is not</h2>
  <p>A grade is not a recommendation for your dog. A grade-A intervention can be wrong for an individual animal with the
  wrong comorbidities, and a grade-C intervention may be exactly right when better options are contraindicated. The
  grade tells you how strong the general evidence is. Your veterinarian applies it to a specific animal.</p>
  <p>Regulatory approval and evidence grade are also different things. Approval reflects what a regulator accepted at a
  point in time under a particular standard, and standards differ across decades and across approval pathways. Some
  approved products here sit at grade C. That is not an error.</p>
</section>

<section>
  <h2>Review cadence</h2>
  <p>Every intervention carries a <code>last_reviewed</code> date. Entries older than twelve months are flagged for
  re-review, because a page that was accurate in 2024 may not be now. The anti-NGF safety discussion is a live example.</p>
</section>`;
}

export function aboutPage(ctx) {
  return `<header class="hero">
  <h1>About Evidence Hound</h1>
  <p class="lede">An open, citable reference for the medicine of aging dogs, assembled from randomized controlled trial
  data and published in the open so it can be checked.</p>
</header>

<section>
  <h2>Why this exists</h2>
  <p>Owners of aging dogs are making real medical decisions under time pressure, usually by searching the internet
  between vet visits. What they find is dominated by supplement marketing, forum anecdote, and articles that treat a
  manufacturer's press release and a placebo-controlled trial as equivalent kinds of information. Meanwhile the actual
  trial literature is scattered across paywalled journals in language written for clinicians.</p>
  <p>This site puts the trial evidence in one place, states plainly how strong it is, and shows its work.</p>
</section>

<section>
  <h2>How it is built</h2>
  <p>Every claim lives in a JSON file under <code>data/interventions/</code> with its citations attached. A validator
  enforces the schema, and the site is generated from those files by a dependency-free Node script. There is no CMS, no
  database, and no editorial back room. The content and the code are the same repository, and the published
  <a href="${url(ctx, "/data.json")}">dataset</a> is a single file anyone can download and reuse under CC BY-SA 4.0.</p>
  <p>That structure is deliberate. It means a veterinarian who disagrees with a grade can open a pull request changing
  one field and stating why, and the disagreement becomes part of the public record instead of an argument in a comment
  section.</p>
</section>

<section>
  <h2>What this site will not do</h2>
  <ul>
    <li>Tell you what to give your dog. It has never met your dog.</li>
    <li>Take affiliate revenue or product sponsorship. The moment a site earns money per supplement click, its grades
    stop being trustworthy.</li>
    <li>Hide negative findings. Grade D exists precisely so failures stay visible.</li>
    <li>Treat regulatory approval as proof of effectiveness, or absence of approval as proof of uselessness.</li>
  </ul>
</section>

<section>
  <h2>Contributing</h2>
  <p>Corrections, new interventions, and challenges to existing grades are all welcome, particularly from veterinarians
  and researchers. See <a href="https://github.com/lextechx/evidence-hound/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>.
  If you are citing a trial we have misread, that is the most valuable contribution you can make.</p>
</section>`;
}

/**
 * Deliberately tiny markdown subset: headings, paragraphs, bold, italic,
 * links. Enough for the story page, and not a reason to take a dependency.
 */
function miniMarkdown(source) {
  const inline = (text) =>
    esc(text)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  return source
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("## ")) return `<h2>${inline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${inline(trimmed.slice(2))}</h1>`;
      return `<p>${inline(trimmed)}</p>`;
    })
    .join("\n");
}

export function storyPage(ctx, source, photos = []) {
  const gallery = photos.length
    ? `<figure class="gallery">
  <div class="gallery-grid">
    ${photos
      .map(
        (photo) =>
          `<img src="${url(ctx, `/photos/${esc(photo.file)}`)}" alt="${esc(photo.alt)}" loading="lazy" decoding="async">`,
      )
      .join("\n    ")}
  </div>
  ${
    photos.some((p) => p.caption)
      ? `<figcaption>${photos
          .map((p) => esc(p.caption))
          .filter(Boolean)
          .join(" · ")}</figcaption>`
      : ""
  }
</figure>`
    : "";

  return `<article class="story">
${miniMarkdown(source)}
${gallery}

<p class="story-end"><a class="button" href="${url(ctx, "/monitoring/")}">The monitoring framework</a>
<a class="button button-secondary" href="${url(ctx, "/")}">What the evidence says</a></p>
</article>`;
}

export function dataPage(ctx, source) {
  return `<article class="story">
${miniMarkdown(source)}

<p class="story-end"><a class="button" href="${url(ctx, "/data.json")}">Download the open dataset</a>
<a class="button button-secondary" href="${url(ctx, "/methods/")}">How we grade</a></p>
</article>`;
}


export function trackPage(ctx) {
  return `<header class="hero">
  <p class="eyebrow">No account, no spreadsheet</p>
  <h1>Track your dog</h1>
  <p class="lede">Fill this in before each vet visit and it turns what you have noticed at home into a dated report your
  veterinarian can act on. It works in this browser, saves on this device, and needs nothing installed.</p>
</header>

<div id="flash" class="flash" role="status" aria-live="polite"></div>

<div id="tracker">
  <section class="panel">
    <h2>Your dog</h2>
    <div id="dog-form" class="field-grid"></div>
  </section>

  <section class="panel">
    <h2>This review</h2>
    <p>Score what you can. A domain you skip is left out of the report rather than counted as normal, so partial is fine
    and far better than nothing. Use the same instrument every time so the trend means something.</p>
    <div class="field-row">
      <div class="field">
        <label for="review-date">Date of this review</label>
        <input type="date" id="review-date">
      </div>
      <div class="field">
        <label for="review-weight">Weight (kg)</label>
        <input type="number" step="0.1" id="review-weight" placeholder="29.8">
      </div>
    </div>
    <div id="domains-form"></div>
    <p class="actions"><button type="button" id="save-review" class="button">Save this review</button></p>
  </section>

  <section class="panel report-panel">
    <div id="report"></div>
    <p class="actions">
      <button type="button" id="print-report" class="button">Print or save as PDF</button>
      <button type="button" id="export" class="button button-secondary">Export my data</button>
      <label class="button button-secondary" for="import">Import a file</label>
      <input type="file" id="import" accept="application/json" hidden>
      <button type="button" id="clear" class="button button-secondary danger">Delete this record</button>
    </p>
  </section>
</div>

<section class="cta no-print">
  <h2>Where this data lives</h2>
  <p>In this browser on this device, and nowhere else. There is no account and nothing is sent to a server, which also
  means it will not follow you to your phone and clearing your browser data will erase it. Export a copy to keep it
  safe. The exported file is the same format the
  <a href="${url(ctx, "/monitoring/")}">command-line tool</a> reads, so neither tool traps your data.</p>
  <p>See <a href="${url(ctx, "/data/")}">how we handle data</a> for what changes if saved accounts ever arrive.</p>
</section>

<script src="${url(ctx, "/app.js")}" defer></script>`;
}

export function monitoringPage(ctx, monitoring) {
  const domainBlock = (domain) => {
    const links = (domain.links ?? [])
      .map((id) => {
        const target = ctx.interventions.find((i) => i.id === id);
        return target ? `<a href="${url(ctx, `/interventions/${id}/`)}">${esc(target.name)}</a>` : "";
      })
      .filter(Boolean)
      .join(", ");

    return `<article class="domain" id="${esc(domain.id)}">
  <div class="card-head">
    <span class="pill">${esc(domain.priority)}</span>
    <span class="category">${esc(domain.direction.replaceAll("_", " "))}</span>
  </div>
  <h3>${esc(domain.name)}</h3>
  <p class="domain-why">${esc(domain.why)}</p>
  <dl class="practical">
    <div><dt>What to measure</dt><dd>${esc(domain.measure)}</dd></div>
    ${domain.instrument ? `<div><dt>Instrument</dt><dd>${esc(domain.instrument)}</dd></div>` : ""}
    <div><dt>How often</dt><dd>${esc(domain.cadence)}</dd></div>
    ${domain.target ? `<div><dt>Target</dt><dd>${esc(domain.target)}</dd></div>` : ""}
  </dl>
  <div class="flags">
    <h4>Escalate on</h4>
    <ul>${domain.red_flags.map((flag) => `<li>${esc(flag)}</li>`).join("")}</ul>
  </div>
  ${links ? `<p class="domain-links">Related interventions: ${links}</p>` : ""}
</article>`;
  };

  const core = monitoring.domains.filter((d) => d.priority === "core");
  const supporting = monitoring.domains.filter((d) => d.priority === "supporting");

  return `<header class="hero">
  <h1>${esc(monitoring.framework.name)}</h1>
  <p class="lede">${esc(monitoring.framework.premise)}</p>
</header>

<section>
  <h2>How to use it</h2>
  <p>${esc(monitoring.framework.how_to_use)}</p>
  <p><strong>Default cadence:</strong> ${esc(monitoring.framework.cadence_default)}</p>
  <p class="aside">The point of a fixed domain list is that it does not depend on what you happened to notice this month.
  Scoring a domain that turns out fine costs a minute; not scoring the one that was drifting costs considerably more.</p>
</section>

<section>
  <h2>Generate a report for your vet</h2>
  <p><strong>Most people want <a href="${url(ctx, "/track/")}">the browser tracker</a></strong>, which does all of this
  as a form with nothing to install. The command-line route below is for people who would rather keep the record as a
  file they control.</p>
  <p>Record each review in a JSON profile and the repository will produce a dated report. Red flags first, then what
  changed since last time, then the domains you did not assess, listed explicitly so an unmeasured domain is never
  mistaken for a normal one.</p>
  <pre class="code-block"><code>node scripts/report.mjs my-dog.json --out report.md</code></pre>
  <p>Start from
  <a href="https://github.com/lextechx/evidence-hound/blob/main/examples/dog-profile.example.json">the example profile</a>.
  The command-line tool runs entirely on your own computer and sends nothing anywhere.</p>
  <p class="aside">A hosted version with saved profiles is planned, so you do not have to keep a JSON file to use this.
  When it arrives it will store your dog's health record on our servers, which is a different arrangement from the tool
  above. What gets stored, who can see it, and how to export or delete it will be spelled out before you are asked to
  enter anything. See <a href="${url(ctx, "/data/")}">how we handle data</a>.</p>
</section>

<section>
  <h2>Core domains</h2>
  <p>Assess all of these at every review.</p>
  <div class="domains">
    ${core.map(domainBlock).join("\n    ")}
  </div>
</section>

<section>
  <h2>Supporting domains</h2>
  <p>Assess at every review where practical; these carry lower urgency but catch things the core set misses.</p>
  <div class="domains">
    ${supporting.map(domainBlock).join("\n    ")}
  </div>
</section>

<section class="cta">
  <h2>A note on what this framework is</h2>
  <p>It is a structured checklist assembled from established veterinary geriatric practice and the instruments used in
  the trials cited elsewhere on this site. Unlike the intervention pages, the framework as a whole has not itself been
  tested in a randomized trial. No monitoring protocol for dogs has. The individual instruments it uses are validated;
  the specific combination and cadence are a reasonable synthesis, not a proven one. It is graded honestly here rather
  than dressed up as something stronger.</p>
</section>`;
}

export function notFoundPage(ctx) {
  return `<header class="hero">
  <h1>Nothing here</h1>
  <p class="lede">That page does not exist. Try the <a href="${url(ctx, "/")}">list of interventions</a>.</p>
</header>`;
}
