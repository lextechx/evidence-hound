/*
 * Evidence Hound: what actually works for aging dogs.
 * Copyright (C) 2026 Alexandria Towne and Evidence Hound contributors.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version. It is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE. See <https://www.gnu.org/licenses/> for the full license.
 *
 * Source: https://github.com/lextechx/evidence-hound
 */

/**
 * Minimal JSON Schema validator covering the subset used by
 * data/schema/intervention.schema.json. Kept dependency-free so that
 * contributors can run `npm run validate` with nothing but Node installed.
 */

const typeOf = (value) => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
};

const matchesType = (value, expected) => {
  const actual = typeOf(value);
  if (expected === "number") return actual === "number" || actual === "integer";
  return actual === expected;
};

export function validate(value, schema, path = "") {
  const errors = [];
  const at = path || "(root)";

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${at}: expected ${schema.type}, got ${typeOf(value)}`);
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  }

  if (schema.type === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${at}: needs at least ${schema.minLength} characters, has ${value.length}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${at}: "${value}" does not match ${schema.pattern}`);
    }
  }

  if (schema.type === "integer" || schema.type === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${at}: ${value} is below minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${at}: ${value} is above maximum ${schema.maximum}`);
    }
  }

  if (schema.type === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${at}: needs at least ${schema.minItems} item(s), has ${value.length}`);
    }
    if (schema.items) {
      value.forEach((item, i) => errors.push(...validate(item, schema.items, `${at}[${i}]`)));
    }
  }

  if (schema.type === "object") {
    for (const key of schema.required ?? []) {
      if (value[key] === undefined) errors.push(`${at}: missing required field "${key}"`);
    }
    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) errors.push(`${at}: unexpected field "${key}"`);
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties ?? {})) {
      if (value[key] !== undefined) {
        errors.push(...validate(value[key], subSchema, path ? `${path}.${key}` : key));
      }
    }
  }

  return errors;
}
