/*
 * Browser tracker for the monitoring framework.
 *
 * Deliberately dependency-free and offline: everything is kept in
 * localStorage, nothing is sent anywhere, and the export format is
 * byte-compatible with scripts/report.mjs so the two tools interoperate.
 */

const STORE = "evidence-hound/profile/v1";
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, props = {}, kids = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const kid of [].concat(kids)) node.append(kid);
  return node;
};

let DOMAINS = [];
let profile = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupt or unavailable storage falls through to a fresh profile */
  }
  return { dog: {}, medications: [], reviews: [] };
}

function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(profile));
    flash("Saved to this browser");
  } catch {
    flash("Could not save. Your browser may be blocking storage.", true);
  }
}

let flashTimer;
function flash(message, isError = false) {
  const bar = $("#flash");
  bar.textContent = message;
  bar.className = isError ? "flash flash-error is-on" : "flash is-on";
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => bar.classList.remove("is-on"), 3200);
}

const sorted = () => [...profile.reviews].sort((a, b) => a.date.localeCompare(b.date));

function trend(domainId, latest, previous) {
  const now = latest?.domains?.[domainId]?.score;
  const before = previous?.domains?.[domainId]?.score;
  if (typeof now !== "number" || typeof before !== "number") return null;
  const delta = now - before;
  const signed = `${delta > 0 ? "+" : ""}${delta}`;
  if (delta === 0) return { delta, worse: false, label: "unchanged" };
  const direction = DOMAINS.find((d) => d.id === domainId)?.direction ?? "neutral";
  if (direction === "neutral") return { delta, worse: false, label: `${signed}, changed` };
  const worse = direction === "higher_is_worse" ? delta > 0 : delta < 0;
  return { delta, worse, label: `${signed}, ${worse ? "worse" : "better"}` };
}

/* ---------- Dog details ---------- */

function renderDog() {
  const form = $("#dog-form");
  form.innerHTML = "";
  const fields = [
    ["name", "Name", "text", "Koda"],
    ["breed", "Breed", "text", "Siberian Husky"],
    ["sex", "Sex", "text", "female, spayed"],
    ["birth_date", "Date of birth", "date", ""],
  ];
  for (const [key, label, type, placeholder] of fields) {
    const input = el("input", { type, id: `dog-${key}`, value: profile.dog?.[key] ?? "", placeholder });
    input.addEventListener("change", () => {
      profile.dog = { ...profile.dog, [key]: input.value };
      save();
      renderReport();
    });
    form.append(el("div", { className: "field" }, [el("label", { htmlFor: `dog-${key}`, textContent: label }), input]));
  }
}

/* ---------- Review entry ---------- */

function renderReviewForm() {
  const wrap = $("#domains-form");
  wrap.innerHTML = "";

  const today = new Date().toISOString().slice(0, 10);
  $("#review-date").value = today;

  for (const domain of DOMAINS) {
    const box = el("details", { className: "entry" });
    box.append(
      el("summary", {}, [
        el("span", { className: "entry-name", textContent: domain.name }),
        el("span", { className: "pill", textContent: domain.priority }),
      ]),
    );

    box.append(el("p", { className: "entry-why", textContent: domain.why }));
    box.append(el("p", { className: "entry-measure", textContent: `What to measure: ${domain.measure}` }));

    const score = el("input", {
      type: "number",
      step: "any",
      id: `score-${domain.id}`,
      placeholder: "Score or value",
    });
    const notes = el("input", { type: "text", id: `notes-${domain.id}`, placeholder: "Notes (optional)" });

    box.append(
      el("div", { className: "field-row" }, [
        el("div", { className: "field" }, [el("label", { htmlFor: score.id, textContent: "Score" }), score]),
        el("div", { className: "field" }, [el("label", { htmlFor: notes.id, textContent: "Notes" }), notes]),
      ]),
    );

    const flagWrap = el("fieldset", { className: "flagset" }, [
      el("legend", { textContent: "Tick anything you have seen" }),
    ]);
    domain.red_flags.forEach((flag, i) => {
      const id = `flag-${domain.id}-${i}`;
      const cb = el("input", { type: "checkbox", id, value: flag });
      flagWrap.append(el("label", { className: "check", htmlFor: id }, [cb, el("span", { textContent: flag })]));
    });
    box.append(flagWrap);
    wrap.append(box);
  }
}

function collectReview() {
  const date = $("#review-date").value;
  if (!date) {
    flash("Pick a date for this review", true);
    return null;
  }

  const review = { date, domains: {} };
  const weight = $("#review-weight").value;
  if (weight) review.weight_kg = Number(weight);

  for (const domain of DOMAINS) {
    const score = $(`#score-${domain.id}`).value;
    const notes = $(`#notes-${domain.id}`).value.trim();
    const flags = [...document.querySelectorAll(`[id^="flag-${domain.id}-"]:checked`)].map((cb) => cb.value);
    if (!score && !notes && !flags.length) continue;

    const entry = {};
    if (score !== "") entry.score = Number(score);
    if (notes) entry.notes = notes;
    if (flags.length) entry.flags = flags;
    if (domain.instrument) entry.instrument = domain.instrument;
    review.domains[domain.id] = entry;
  }

  if (!Object.keys(review.domains).length) {
    flash("Fill in at least one domain before saving", true);
    return null;
  }
  return review;
}

/* ---------- Report ---------- */

function renderReport() {
  const out = $("#report");
  const reviews = sorted();

  if (!reviews.length) {
    out.innerHTML = "";
    out.append(
      el("p", {
        className: "aside",
        textContent:
          "No reviews saved yet. Fill in what you can above and save. Even a partial first review is useful, because it becomes the baseline everything later is compared against.",
      }),
    );
    return;
  }

  const latest = reviews.at(-1);
  const previous = reviews.at(-2);
  const answered = DOMAINS.filter((d) => latest.domains?.[d.id]);
  const missing = DOMAINS.filter((d) => !latest.domains?.[d.id]);
  const missingCore = missing.filter((d) => d.priority === "core");
  const flagged = answered.flatMap((d) => (latest.domains[d.id].flags ?? []).map((f) => ({ domain: d, flag: f })));
  const moved = answered
    .map((d) => ({ domain: d, t: trend(d.id, latest, previous) }))
    .filter((r) => r.t && r.t.delta !== 0);

  out.innerHTML = "";
  const dog = profile.dog ?? {};

  out.append(el("h2", { textContent: `Report for ${dog.name || "your dog"}` }));
  out.append(
    el("p", {
      className: "report-meta",
      textContent: `Review of ${latest.date}. ${reviews.length} review${reviews.length === 1 ? "" : "s"} on record${
        previous ? `, previous ${previous.date}` : ""
      }. ${answered.length} of ${DOMAINS.length} domains assessed.`,
    }),
  );

  if (flagged.length) {
    out.append(el("h3", { textContent: "Raise these first" }));
    out.append(
      el(
        "ul",
        { className: "report-flags" },
        flagged.map(({ domain, flag }) => el("li", {}, [el("strong", { textContent: `${domain.name}. ` }), flag])),
      ),
    );
  }

  if (moved.length) {
    out.append(el("h3", { textContent: `What changed since ${previous.date}` }));
    const rows = moved.map(({ domain, t }) =>
      el("tr", {}, [
        el("td", { textContent: domain.name }),
        el("td", { textContent: String(previous.domains[domain.id]?.score ?? "") }),
        el("td", { textContent: String(latest.domains[domain.id].score) }),
        el("td", { className: t.worse ? "worse" : "better", textContent: t.label }),
      ]),
    );
    out.append(
      el("div", { className: "table-scroll" }, [
        el("table", {}, [
          el("thead", {}, el("tr", {}, ["Domain", "Was", "Now", "Change"].map((h) => el("th", { textContent: h })))),
          el("tbody", {}, rows),
        ]),
      ]),
    );
  }

  if (missing.length) {
    out.append(el("h3", { textContent: "Not assessed this time" }));
    out.append(
      el("p", {
        className: "aside",
        textContent: "Listed so an unmeasured domain is never mistaken for a normal one.",
      }),
    );
    out.append(
      el(
        "ul",
        {},
        missing.map((d) =>
          el("li", {}, [d.name, d.priority === "core" ? el("strong", { textContent: " (core)" }) : ""]),
        ),
      ),
    );
  }

  const questions = [
    ...flagged.map(({ domain, flag }) => `On ${domain.name.toLowerCase()}: ${flag}. What should we do about this?`),
    ...moved.filter((r) => r.t.worse).map(({ domain }) => `${domain.name} moved the wrong way. Is that expected?`),
    ...missingCore.map((d) => `We have not assessed ${d.name.toLowerCase()}. Should we today?`),
  ];
  out.append(el("h3", { textContent: "Questions for the appointment" }));
  out.append(
    el(
      "ul",
      {},
      questions.length
        ? questions.map((q) => el("li", { textContent: q }))
        : [el("li", { textContent: "Nothing flagged. What should I watch for before the next visit?" })],
    ),
  );
}

/* ---------- Import and export ---------- */

function download() {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const name = (profile.dog?.name || "dog").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const a = el("a", { href: url, download: `${name}-monitoring.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.reviews)) {
        throw new Error("not a profile");
      }
      profile = parsed;
      save();
      renderDog();
      renderReport();
      flash("Profile loaded");
    } catch {
      flash("That file is not a profile export", true);
    }
  };
  reader.readAsText(file);
}

/* ---------- Boot ---------- */

async function init() {
  try {
    const res = await fetch("../data.json");
    const data = await res.json();
    DOMAINS = data.monitoring.domains;
  } catch {
    $("#tracker").innerHTML =
      "<p class='aside'>Could not load the monitoring framework. Check your connection and reload.</p>";
    return;
  }

  renderDog();
  renderReviewForm();
  renderReport();

  $("#save-review").addEventListener("click", () => {
    const review = collectReview();
    if (!review) return;
    const existing = profile.reviews.findIndex((r) => r.date === review.date);
    if (existing >= 0) profile.reviews[existing] = review;
    else profile.reviews.push(review);
    save();
    renderReport();
    $("#report").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#print-report").addEventListener("click", () => window.print());
  $("#export").addEventListener("click", download);
  $("#import").addEventListener("change", (e) => {
    if (e.target.files?.[0]) importFile(e.target.files[0]);
  });
  $("#clear").addEventListener("click", () => {
    if (!confirm("Delete this dog's record from this browser? This cannot be undone.")) return;
    localStorage.removeItem(STORE);
    profile = { dog: {}, medications: [], reviews: [] };
    renderDog();
    renderReport();
    flash("Record cleared");
  });
}

init();
