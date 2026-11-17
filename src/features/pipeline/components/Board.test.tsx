import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { databaseSchema, type Contact } from "@/features/contacts/schema";
import { makeContact } from "@/test/factories";
import { setFailureSimulated } from "@/lib/simulate";
import { DATABASE_KEY, readItem, writeItem } from "@/lib/storage";
import { Board } from "./Board";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/pipeline",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), warning: vi.fn() }),
}));

// Real repository on jsdom localStorage. Every repository call waits here until the test releases it.
let pendingLatency: Array<() => void> = [];
vi.mock("@/lib/delay", () => ({
  delay: () => Promise.resolve(),
  simulateLatency: () =>
    new Promise<void>((resolve) => {
      pendingLatency.push(resolve);
    }),
}));

/** Lets only the repository calls waiting right now finish, not the ones they start next. */
async function releaseOnce() {
  const waiting = pendingLatency;
  pendingLatency = [];
  waiting.forEach((release) => release());
  await new Promise((r) => setTimeout(r, 0));
}

/** Lets every waiting repository call finish, a few rounds deep (a save, then its refetch). */
async function finishRequests() {
  for (let i = 0; i < 5; i += 1) {
    const waiting = pendingLatency;
    pendingLatency = [];
    waiting.forEach((release) => release());
    await new Promise((r) => setTimeout(r, 0));
  }
}

let ana: Contact;
let flagged: Contact;
let ben: Contact;

/** Two Leads, one Active, nobody Closed, so the Closed column is empty. */
function seedStorage() {
  ana = makeContact({ fullName: "Ana Silva", status: "lead", lastActivityAt: "2026-11-05T10:00:00.000Z" });
  flagged = makeContact({
    fullName: "Flo Flagged",
    status: "lead",
    conflictCheck: "flagged",
    lastActivityAt: "2026-11-04T10:00:00.000Z",
  });
  ben = makeContact({ fullName: "Ben Okafor", status: "active" });
  writeItem(DATABASE_KEY, { contacts: [ana, flagged, ben], notes: [], activities: [] });
}

function renderBoard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Board />
    </QueryClientProvider>,
  );
  return client;
}

async function openBoard() {
  seedStorage();
  const client = renderBoard();
  await finishRequests();
  await screen.findByRole("heading", { name: "Lead, 2 contacts" });
  return client;
}

/** The column whose heading starts with the given label, e.g. "Lead". */
function column(label: string) {
  const heading = screen.getByRole("heading", { level: 2, name: new RegExp(`^${label},`) });
  const section = heading.closest("section");
  if (!section) throw new Error(`No column found for ${label}`);
  return within(section);
}

async function moveVia(name: string, destination: string) {
  await userEvent.click(screen.getByRole("button", { name: `Move ${name}` }));
  await userEvent.click(await screen.findByRole("menuitem", { name: `Move to ${destination}` }));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  pendingLatency = [];
});

describe("Move menu", () => {
  it("lists the two other statuses", async () => {
    await openBoard();
    await userEvent.click(screen.getByRole("button", { name: "Move Ana Silva" }));

    expect(await screen.findAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByRole("menuitem", { name: "Move to Active" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Move to Closed" })).toBeInTheDocument();
  });

  it("moves the card at once, then toasts with an Undo action once saved", async () => {
    await openBoard();
    await moveVia("Ana Silva", "Closed");

    // Nothing has been released yet, so this is the optimistic state.
    await waitFor(() => expect(column("Closed").getByText("Ana Silva")).toBeInTheDocument());
    expect(column("Lead").queryByText("Ana Silva")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lead, 1 contact" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Closed, 1 contact" })).toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();

    await finishRequests();

    expect(toast).toHaveBeenCalledWith(
      "Ana Silva moved to Closed.",
      expect.objectContaining({ action: expect.objectContaining({ label: "Undo" }) }),
    );
    expect(column("Closed").getByText("Ana Silva")).toBeInTheDocument();
  });

  it("warns in the toast when a flagged conflict moves to Active", async () => {
    await openBoard();
    await moveVia("Flo Flagged", "Active");
    await finishRequests();

    expect(toast.warning).toHaveBeenCalledWith(
      "Flo Flagged moved to Active. Conflict check is still flagged.",
      expect.objectContaining({ action: expect.objectContaining({ label: "Undo" }) }),
    );
  });

  it("writes a status_changed activity in the repository", async () => {
    await openBoard();
    await moveVia("Ana Silva", "Active");
    await finishRequests();

    const { activities } = readItem(DATABASE_KEY, databaseSchema) ?? { activities: [] };
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      type: "status_changed",
      contactId: ana.id,
      meta: { from: "lead", to: "active" },
    });
  });

  it("puts focus on the moved card's Move button in its new column", async () => {
    await openBoard();
    await moveVia("Ana Silva", "Closed");

    // Looked up inside Closed: Radix first returns focus to the old button in Lead.
    await waitFor(() =>
      expect(column("Closed").getByRole("button", { name: "Move Ana Silva" })).toHaveFocus(),
    );
  });
});

describe("when a move fails", () => {
  it("shows the card in the new column, then back, with an error toast and no error screen", async () => {
    await openBoard();
    setFailureSimulated(true);
    await moveVia("Ana Silva", "Closed");

    await waitFor(() => expect(column("Closed").getByText("Ana Silva")).toBeInTheDocument());

    await finishRequests();

    expect(column("Lead").getByText("Ana Silva")).toBeInTheDocument();
    expect(column("Closed").queryByText("Ana Silva")).not.toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      "Couldn't move Ana Silva. The card is back in Lead. Try again.",
      expect.objectContaining({ action: expect.objectContaining({ label: "Try again" }) }),
    );
    // The refetch after the failure fails too, but the last good data stays on screen.
    expect(screen.queryByText("Pipeline didn't load")).not.toBeInTheDocument();
    expect(await screen.findByText("Couldn't refresh.")).toBeInTheDocument();
  });

  it("puts back only the card whose save failed", async () => {
    await openBoard();
    await moveVia("Ana Silva", "Closed");
    await moveVia("Ben Okafor", "Closed");

    // Ana's save fails; Ben's runs after it and succeeds.
    setFailureSimulated(true);
    await releaseOnce();
    setFailureSimulated(false);
    await finishRequests();

    expect(column("Lead").getByText("Ana Silva")).toBeInTheDocument();
    expect(column("Closed").getByText("Ben Okafor")).toBeInTheDocument();
  });
});

describe("two quick moves of one card", () => {
  it("saves them one at a time, in click order", async () => {
    await openBoard();
    await moveVia("Ana Silva", "Active");
    await moveVia("Ana Silva", "Closed");

    // Both cards moved on screen, but only the first save is running.
    expect(column("Closed").getByText("Ana Silva")).toBeInTheDocument();
    expect(pendingLatency).toHaveLength(1);

    await finishRequests();

    const db = readItem(DATABASE_KEY, databaseSchema);
    expect(db?.contacts.find((c) => c.id === ana.id)?.status).toBe("closed");
    expect(db?.activities).toMatchObject([
      { type: "status_changed", meta: { from: "lead", to: "active" } },
      { type: "status_changed", meta: { from: "active", to: "closed" } },
    ]);
  });
});

describe("Undo", () => {
  /** Moves Ana to Closed, waits for the save, and returns the Undo action from the toast. */
  async function moveAndGetUndo() {
    await openBoard();
    await moveVia("Ana Silva", "Closed");
    await finishRequests();
    const options = vi.mocked(toast).mock.calls[0][1] as { action?: { onClick: () => void } } | undefined;
    if (!options?.action) throw new Error("The toast has no Undo action");
    return options.action.onClick;
  }

  it("moves the card back and says so", async () => {
    const undo = await moveAndGetUndo();
    undo();
    await finishRequests();

    expect(toast).toHaveBeenCalledWith("Move undone. Ana Silva is back in Lead.", expect.anything());
    expect(column("Lead").getByText("Ana Silva")).toBeInTheDocument();
  });

  it("says the card is still where it was when the undo fails", async () => {
    const undo = await moveAndGetUndo();
    setFailureSimulated(true);
    undo();
    await finishRequests();

    expect(toast.error).toHaveBeenCalledWith(
      "Couldn't undo the move. Ana Silva is still in Closed.",
      expect.anything(),
    );
    expect(column("Closed").getByText("Ana Silva")).toBeInTheDocument();
  });
});

describe("board states", () => {
  it("shows the loading skeleton while the contacts load", () => {
    seedStorage();
    renderBoard();

    expect(screen.getByRole("status")).toHaveTextContent("Loading pipeline…");
  });

  it("shows an error with Try again when the first load fails", async () => {
    seedStorage();
    setFailureSimulated(true);
    renderBoard();
    await finishRequests();

    expect(await screen.findByText("Pipeline didn't load")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("keeps the board and shows a notice when a reload fails", async () => {
    const client = await openBoard();
    setFailureSimulated(true);
    void client.invalidateQueries();
    await finishRequests();

    expect(await screen.findByText("Couldn't refresh.")).toBeInTheDocument();
    expect(column("Lead").getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.queryByText("Pipeline didn't load")).not.toBeInTheDocument();
  });

  it("explains an empty column", async () => {
    await openBoard();

    expect(column("Closed").getByText("Nothing closed yet.")).toBeInTheDocument();
    expect(column("Closed").getByText("Drag a card here, or use Move on any card.")).toBeInTheDocument();
  });
});
