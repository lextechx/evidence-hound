import { test } from "node:test";
import assert from "node:assert/strict";
import { loadData, collectErrors } from "./validate.mjs";
import { validate } from "./schema.mjs";

const data = await loadData();

test("every intervention passes schema and cross-reference validation", () => {
  assert.deepEqual(collectErrors(data), []);
});

test("the dataset is not empty", () => {
  assert.ok(data.interventions.length > 0);
  assert.ok(Object.keys(data.conditions).length > 0);
});

test("every evidence entry carries a citation and a year", () => {
  for (const item of data.interventions) {
    for (const entry of item.evidence) {
      assert.ok(entry.citation?.length > 10, `${item.id}: evidence entry needs a real citation`);
      assert.equal(typeof entry.year, "number", `${item.id}: evidence entry needs a year`);
    }
  }
});

test("grade A and B claims rest on at least one randomized or pooled study", () => {
  const strong = new Set(["rct", "meta_analysis", "systematic_review"]);
  for (const item of data.interventions.filter((i) => i.tier === "A" || i.tier === "B")) {
    assert.ok(
      item.evidence.some((entry) => strong.has(entry.type)),
      `${item.id} is graded ${item.tier} but cites no randomized or pooled evidence`,
    );
  }
});

test("grade U interventions do not claim completed randomized evidence", () => {
  for (const item of data.interventions.filter((i) => i.tier === "U")) {
    assert.ok(
      !item.evidence.some((entry) => entry.type === "rct"),
      `${item.id} is graded U (untested) but cites a completed RCT, so regrade it`,
    );
  }
});

test("every monitoring domain declares which direction is bad", () => {
  for (const domain of data.monitoring.domains) {
    assert.ok(
      ["higher_is_worse", "higher_is_better", "neutral"].includes(domain.direction),
      `${domain.id} has no usable direction, so trends would be reported backwards`,
    );
    assert.ok(domain.red_flags.length > 0, `${domain.id} needs at least one escalation trigger`);
  }
});

test("core monitoring domains outnumber supporting ones", () => {
  const core = data.monitoring.domains.filter((d) => d.priority === "core");
  assert.ok(core.length >= 6, "the core set should cover the main axes of decline");
});

test("the schema validator rejects a malformed record", () => {
  const errors = validate({ id: "Bad Id" }, data.schema);
  assert.ok(errors.length > 0);
  assert.ok(errors.some((e) => e.includes("does not match")));
});
