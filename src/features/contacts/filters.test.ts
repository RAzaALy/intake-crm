import { describe, expect, it } from "vitest";
import { makeContact } from "@/test/factories";
import {
  applyListParams,
  countByStatus,
  DEFAULT_LIST_PARAMS,
  filterByStatus,
  matchesQuery,
  parseListParams,
  sortContacts,
  toQueryString,
} from "./filters";

const amna = makeContact({
  fullName: "Amna Khan",
  email: "amna@example.com",
  phone: "+1 555 010 4477",
});

describe("parseListParams", () => {
  it("uses defaults for an empty URL", () => {
    expect(parseListParams(new URLSearchParams(""))).toEqual(DEFAULT_LIST_PARAMS);
  });

  it("falls back to defaults for an unknown status or sort", () => {
    const params = parseListParams(new URLSearchParams("status=won&sort=random"));
    expect(params.status).toBe("all");
    expect(params.sort).toBe("activity");
  });
});

describe("toQueryString", () => {
  it("omits default values", () => {
    expect(toQueryString(DEFAULT_LIST_PARAMS)).toBe("");
  });

  it("round-trips with parseListParams", () => {
    const params = { query: "amna", status: "closed", sort: "name" } as const;
    expect(parseListParams(new URLSearchParams(toQueryString(params)))).toEqual(params);
  });

  it("keeps trailing spaces in the query", () => {
    const params = { ...DEFAULT_LIST_PARAMS, query: "Amna " };
    expect(parseListParams(new URLSearchParams(toQueryString(params))).query).toBe("Amna ");
  });
});

describe("matchesQuery", () => {
  it("matches name, email and phone ignoring case", () => {
    expect(matchesQuery(amna, "AMNA k")).toBe(true);
    expect(matchesQuery(amna, "EXAMPLE.com")).toBe(true);
    expect(matchesQuery(amna, "+1 555")).toBe(true);
  });

  it("matches a phone by digits alone", () => {
    expect(matchesQuery(amna, "0104477")).toBe(true);
  });

  it("does not match phone digits when the query also has letters", () => {
    expect(matchesQuery(amna, "Amna 2")).toBe(false);
  });

  it("does not digit-match with fewer than 3 digits", () => {
    const bracketed = makeContact({ phone: "+1 (555) 010-4477" });
    expect(matchesQuery(bracketed, "501")).toBe(true);
    expect(matchesQuery(bracketed, "5 0")).toBe(false);
  });

  it("matches everything for a blank query", () => {
    expect(matchesQuery(amna, "   ")).toBe(true);
  });
});

describe("filterByStatus", () => {
  const contacts = [
    makeContact({ status: "lead" }),
    makeContact({ status: "active" }),
    makeContact({ status: "closed" }),
  ];

  it("returns only the chosen status", () => {
    expect(filterByStatus(contacts, "active")).toEqual([contacts[1]]);
  });

  it("returns everything for all", () => {
    expect(filterByStatus(contacts, "all")).toHaveLength(3);
  });
});

describe("sortContacts", () => {
  const a = makeContact({ fullName: "bob", createdAt: "2026-01-02T00:00:00.000Z", lastActivityAt: "2026-03-01T00:00:00.000Z" });
  const b = makeContact({ fullName: "Alice", createdAt: "2026-01-03T00:00:00.000Z", lastActivityAt: "2026-02-01T00:00:00.000Z" });
  const c = makeContact({ fullName: "Carol", createdAt: "2026-01-01T00:00:00.000Z", lastActivityAt: "2026-04-01T00:00:00.000Z" });

  it("sorts by last activity, newest first", () => {
    expect(sortContacts([a, b, c], "activity")).toEqual([c, a, b]);
  });

  it("sorts by date added, newest first", () => {
    expect(sortContacts([a, b, c], "added")).toEqual([b, a, c]);
  });

  it("sorts by name ignoring case", () => {
    expect(sortContacts([a, c, b], "name")).toEqual([b, a, c]);
  });

  it("does not mutate the input", () => {
    const input = [a, b, c];
    sortContacts(input, "name");
    expect(input).toEqual([a, b, c]);
  });
});

describe("countByStatus and applyListParams", () => {
  const contacts = [
    makeContact({ fullName: "Zed One", status: "lead" }),
    makeContact({ fullName: "Zed Two", status: "lead" }),
    makeContact({ fullName: "Zed Three", status: "closed" }),
    makeContact({ fullName: "Other", status: "active" }),
  ];

  it("counts each status and the total", () => {
    expect(countByStatus(contacts)).toEqual({ all: 4, lead: 2, active: 1, closed: 1 });
  });

  it("makes counts follow the search but ignore the status filter", () => {
    const result = applyListParams(contacts, { query: "zed", status: "closed", sort: "name" });
    expect(result.contacts).toHaveLength(1);
    expect(result.counts).toEqual({ all: 3, lead: 2, active: 0, closed: 1 });
  });
});
