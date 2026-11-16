import type {
  Activity,
  Attorney,
  ConflictCheck,
  Contact,
  ContactStatus,
  Database,
  EditableField,
  MatterType,
  Note,
  Source,
} from "../schema";

// Seed rules (docs/PRODUCT_SPEC.md): about 18 contacts, roughly 8 Lead / 6 Active / 4 Closed,
// 2 or 3 flagged conflicts, dates over the last 6 weeks, a believable history for each.
// Times are stored as "days ago" and turned into dates when the seed loads, so relative
// times always look real ("3 days ago") whenever the demo is opened.

type SeedEvent =
  | { kind: "note"; daysAgo: number; body: string }
  | { kind: "status"; daysAgo: number; from: ContactStatus; to: ContactStatus }
  | { kind: "edit"; daysAgo: number; fields: EditableField[] };

interface SeedContact {
  fullName: string;
  email: string;
  phone: string;
  status: ContactStatus;
  matterType: MatterType;
  source: Source;
  assignedTo: Attorney | null;
  conflictCheck: ConflictCheck;
  createdDaysAgo: number;
  events: SeedEvent[];
}

export const SEED_CONTACTS: SeedContact[] = [
  // Leads
  {
    fullName: "Amna Siddiqui",
    email: "amna.siddiqui@example.com",
    phone: "+1 555 010 4477",
    status: "lead",
    matterType: "family",
    source: "website",
    assignedTo: null,
    conflictCheck: "flagged",
    createdDaysAgo: 12.3,
    events: [
      {
        kind: "note",
        daysAgo: 9.1,
        body: "Called about custody after separating from her husband. Conflict flagged: his business partner is a former client. Needs a partner to review before anyone calls her back.",
      },
    ],
  },
  {
    fullName: "Tomás Herrera",
    email: "t.herrera@example.net",
    phone: "(555) 010-2231",
    status: "lead",
    matterType: "immigration",
    source: "phone",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 1.2,
    events: [
      {
        kind: "note",
        daysAgo: 1.1,
        body: "Work visa runs out in March. Employer is willing to sponsor a green card. Wants a consult this week, mornings only.",
      },
    ],
  },
  {
    fullName: "Grace Whitfield",
    email: "grace.whitfield@example.org",
    phone: "555-010-3390",
    status: "lead",
    matterType: "property",
    source: "referral",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 0.15,
    events: [],
  },
  {
    fullName: "Kwame Asante",
    email: "kwame.asante@example.com",
    phone: "+1 555 010 7812",
    status: "lead",
    matterType: "employment",
    source: "website",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 10.4,
    events: [
      {
        kind: "note",
        daysAgo: 10.2,
        body: "Let go two weeks after reporting a safety issue on site. Has the emails. Left a voicemail to book a call.",
      },
    ],
  },
  {
    fullName: "Mei-Lin Zhou",
    email: "meilin.zhou@example.net",
    phone: "(555) 010-6604",
    status: "lead",
    matterType: "corporate",
    source: "referral",
    assignedTo: "Daniel Okafor",
    conflictCheck: "cleared",
    createdDaysAgo: 4.5,
    events: [
      { kind: "edit", daysAgo: 3.9, fields: ["assignedTo", "conflictCheck"] },
      {
        kind: "note",
        daysAgo: 3.8,
        body: "Two co-founders splitting up a bakery business. She wants a buy-out agreement drafted. Referred by one of Daniel's former clients.",
      },
    ],
  },
  {
    fullName: "Rafael Moreno",
    email: "rafa.moreno@example.com",
    phone: "555 010 9145",
    status: "lead",
    matterType: "criminal",
    source: "walk_in",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 2.6,
    events: [
      {
        kind: "note",
        daysAgo: 2.5,
        body: "His son, 19, is charged with possession. Arraignment is on Monday. Asked whether we take legal aid cases.",
      },
      { kind: "note", daysAgo: 2.0, body: "Called back: the court date moved to the 28th." },
    ],
  },
  {
    fullName: "Siobhan O'Connell",
    email: "siobhan.oconnell@example.org",
    phone: "+1 (555) 010-5530",
    status: "lead",
    matterType: "family",
    source: "phone",
    assignedTo: null,
    conflictCheck: "cleared",
    createdDaysAgo: 15.2,
    events: [
      { kind: "edit", daysAgo: 14.8, fields: ["conflictCheck"] },
      {
        kind: "note",
        daysAgo: 14.7,
        body: "Wants to update her will and set up guardianship for her two children. Not urgent. Prefers email over calls.",
      },
    ],
  },
  {
    fullName: "Dmitri Volkov",
    email: "d.volkov@example.net",
    phone: "555-010-2768",
    status: "lead",
    matterType: "property",
    source: "website",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 5.7,
    events: [{ kind: "edit", daysAgo: 5.5, fields: ["phone"] }],
  },

  // Active
  {
    fullName: "Fatima Al-Rashid",
    email: "fatima.alrashid@example.com",
    phone: "+1 555 010 3021",
    status: "active",
    matterType: "immigration",
    source: "referral",
    assignedTo: "Priya Raman",
    conflictCheck: "cleared",
    createdDaysAgo: 38,
    events: [
      {
        kind: "note",
        daysAgo: 37.5,
        body: "Asylum case. Arrived eight months ago and the filing deadline is close. Needs an Arabic interpreter for every meeting.",
      },
      { kind: "status", daysAgo: 33, from: "lead", to: "active" },
      { kind: "note", daysAgo: 30, body: "Interpreter booked for every Tuesday session." },
      { kind: "note", daysAgo: 6.2, body: "Application filed. Waiting on the biometrics appointment." },
    ],
  },
  {
    fullName: "Jonathan Pierce",
    email: "jon.pierce@example.org",
    phone: "(555) 010-8870",
    status: "active",
    matterType: "corporate",
    source: "referral",
    assignedTo: "Daniel Okafor",
    conflictCheck: "cleared",
    createdDaysAgo: 27,
    events: [
      {
        kind: "note",
        daysAgo: 26.4,
        body: "Series A round for his software company. Term sheet is already signed, needs the closing documents.",
      },
      { kind: "status", daysAgo: 24, from: "lead", to: "active" },
      { kind: "edit", daysAgo: 12, fields: ["email"] },
      { kind: "note", daysAgo: 2.3, body: "Closing documents sent to him for review." },
    ],
  },
  {
    fullName: "Lucía Fernández",
    email: "lucia.fernandez@example.com",
    phone: "555 010 4419",
    status: "active",
    matterType: "employment",
    source: "website",
    assignedTo: "Helen Marsh",
    conflictCheck: "flagged",
    createdDaysAgo: 21,
    events: [
      {
        kind: "note",
        daysAgo: 20.6,
        body: "Unpaid overtime claim covering about 14 months. Two coworkers may join the claim.",
      },
      { kind: "status", daysAgo: 18, from: "lead", to: "active" },
      { kind: "edit", daysAgo: 17.2, fields: ["conflictCheck"] },
      {
        kind: "note",
        daysAgo: 17.1,
        body: "Conflict flagged after we took the matter: one coworker is related to a firm employee. Helen knows and an ethical wall is in place.",
      },
    ],
  },
  {
    fullName: "Arjun Mehta",
    email: "arjun.mehta@example.net",
    phone: "+1 555 010 6187",
    status: "active",
    matterType: "property",
    source: "phone",
    assignedTo: "Helen Marsh",
    conflictCheck: "cleared",
    createdDaysAgo: 19,
    events: [
      { kind: "status", daysAgo: 16, from: "lead", to: "active" },
      {
        kind: "note",
        daysAgo: 15,
        body: "Landlord is keeping the full deposit. We have the lease and his move-out photos.",
      },
      { kind: "note", daysAgo: 4.1, body: "Demand letter sent. The landlord has 14 days to respond." },
    ],
  },
  {
    fullName: "Nadia Kowalski",
    email: "nadia.kowalski@example.org",
    phone: "(555) 010-1356",
    status: "active",
    matterType: "family",
    source: "referral",
    assignedTo: "Priya Raman",
    conflictCheck: "cleared",
    createdDaysAgo: 31,
    events: [
      {
        kind: "note",
        daysAgo: 30.7,
        body: "Divorce, both sides amicable and open to mediation. One child and a shared house.",
      },
      { kind: "status", daysAgo: 28, from: "lead", to: "active" },
      { kind: "edit", daysAgo: 20, fields: ["phone", "assignedTo"] },
    ],
  },
  {
    fullName: "Samuel Osei",
    email: "samuel.osei@example.com",
    phone: "555-010-7703",
    status: "active",
    matterType: "criminal",
    source: "walk_in",
    assignedTo: "Daniel Okafor",
    conflictCheck: "cleared",
    createdDaysAgo: 8,
    events: [
      {
        kind: "note",
        daysAgo: 7.9,
        body: "DUI charge, first offence. Licence suspended. Hearing in three weeks.",
      },
      { kind: "status", daysAgo: 7, from: "lead", to: "active" },
      { kind: "note", daysAgo: 1.4, body: "Requested the police body camera footage." },
    ],
  },

  // Closed
  {
    fullName: "Hannah Lindqvist",
    email: "hannah.lindqvist@example.net",
    phone: "+1 555 010 2945",
    status: "closed",
    matterType: "immigration",
    source: "website",
    assignedTo: "Priya Raman",
    conflictCheck: "cleared",
    createdDaysAgo: 41,
    events: [
      { kind: "status", daysAgo: 39, from: "lead", to: "active" },
      { kind: "status", daysAgo: 11, from: "active", to: "closed" },
      { kind: "note", daysAgo: 10.9, body: "Citizenship approved and oath ceremony done. File closed." },
    ],
  },
  {
    fullName: "Marcus Bell",
    email: "marcus.bell@example.com",
    phone: "(555) 010-9032",
    status: "closed",
    matterType: "employment",
    source: "phone",
    assignedTo: null,
    conflictCheck: "flagged",
    createdDaysAgo: 25,
    events: [
      {
        kind: "note",
        daysAgo: 23.5,
        body: "Conflict flagged: we represent his employer. Declined and gave him the bar association referral list.",
      },
      { kind: "status", daysAgo: 23.4, from: "lead", to: "closed" },
    ],
  },
  {
    fullName: "Yusuf Demir",
    email: "yusuf.demir@example.org",
    phone: "555 010 6652",
    status: "closed",
    matterType: "corporate",
    source: "referral",
    assignedTo: "Daniel Okafor",
    conflictCheck: "cleared",
    createdDaysAgo: 35,
    events: [
      { kind: "status", daysAgo: 32, from: "lead", to: "active" },
      { kind: "note", daysAgo: 8, body: "Company dissolution filed and approved by the state." },
      { kind: "status", daysAgo: 7.6, from: "active", to: "closed" },
    ],
  },
  {
    fullName: "Chloé Dubois",
    email: "chloe.dubois@example.com",
    phone: "+1 555 010 8214",
    status: "closed",
    matterType: "family",
    source: "website",
    assignedTo: null,
    conflictCheck: "pending",
    createdDaysAgo: 17,
    events: [
      {
        kind: "note",
        daysAgo: 16,
        body: "Asked about a prenup. The wedding is next year, she'll come back closer to the date.",
      },
      { kind: "note", daysAgo: 13.1, body: "No reply after two follow-ups. Closing for now." },
      { kind: "status", daysAgo: 13, from: "lead", to: "closed" },
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBefore(now: Date, days: number): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

/** Turns the seed table into stored records, with dates counted back from `now`. */
export function buildSeedDatabase(now: Date): Database {
  const contacts: Contact[] = [];
  const notes: Note[] = [];
  const activities: Activity[] = [];

  SEED_CONTACTS.forEach((seed, index) => {
    const contactId = `seed-${String(index + 1).padStart(2, "0")}`;
    const createdAt = daysBefore(now, seed.createdDaysAgo);
    let updatedAt = createdAt;
    let lastActivityAt = createdAt;

    activities.push({ id: `${contactId}-a0`, contactId, type: "created", createdAt });

    seed.events.forEach((event, eventIndex) => {
      const at = daysBefore(now, event.daysAgo);
      const activityId = `${contactId}-a${eventIndex + 1}`;
      // Events are listed oldest first, so the last one wins.
      lastActivityAt = at;

      if (event.kind === "note") {
        notes.push({ id: `${contactId}-n${eventIndex + 1}`, contactId, body: event.body, createdAt: at });
        activities.push({ id: activityId, contactId, type: "note_added", createdAt: at });
        return;
      }

      updatedAt = at;
      if (event.kind === "status") {
        activities.push({
          id: activityId,
          contactId,
          type: "status_changed",
          createdAt: at,
          meta: { from: event.from, to: event.to },
        });
      } else {
        activities.push({
          id: activityId,
          contactId,
          type: "edited",
          createdAt: at,
          meta: { fields: event.fields },
        });
      }
    });

    contacts.push({
      id: contactId,
      fullName: seed.fullName,
      email: seed.email,
      phone: seed.phone,
      status: seed.status,
      matterType: seed.matterType,
      source: seed.source,
      assignedTo: seed.assignedTo,
      conflictCheck: seed.conflictCheck,
      createdAt,
      updatedAt,
      lastActivityAt,
    });
  });

  return { contacts, notes, activities };
}
