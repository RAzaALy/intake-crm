import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setFailureSimulated } from "@/lib/simulate";
import { createContact } from "../api/repository";
import { ContactDetails } from "./ContactDetails";

let contactId = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ id: contactId }),
  usePathname: () => "/contacts/x",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn() }) }));

// Real repository on jsdom localStorage; only the wait is removed, so the pending state
// is controlled by the time the promise takes to resolve.
let releaseLatency: (() => void) | null = null;
vi.mock("@/lib/delay", () => ({
  delay: () => Promise.resolve(),
  simulateLatency: () =>
    new Promise<void>((resolve) => {
      releaseLatency = resolve;
    }),
}));

function renderDetails() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ContactDetails />
    </QueryClientProvider>,
  );
}

/** Lets the repository call that is waiting on latency finish. */
async function finishRequests() {
  // Five rounds covers the longest chain: the write's latency, the mutation settling,
  // then the invalidation refetch's own latency.
  for (let i = 0; i < 5; i += 1) {
    releaseLatency?.();
    releaseLatency = null;
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function openPage() {
  const created = createContact({
    fullName: "Ana Silva",
    email: "ana@example.com",
    phone: "555 010 1111",
    status: "lead",
    matterType: "family",
    source: "website",
  });
  await finishRequests();
  contactId = (await created).id;
  renderDetails();
  await finishRequests();
  await screen.findByRole("heading", { name: "Ana Silva" });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  releaseLatency = null;
});

describe("adding a note", () => {
  it("clears the box, shows Saving…, then the saved note and a timeline entry", async () => {
    await openPage();
    const box = screen.getByRole("textbox", { name: "Add a note" });
    await userEvent.type(box, "Called back, wants a consult");
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(box).toHaveValue("");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
    expect(screen.getByText("Called back, wants a consult")).toBeInTheDocument();

    await finishRequests();

    expect(await screen.findByText("Note added.", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
    expect(screen.getAllByText("Called back, wants a consult")).toHaveLength(1);
    expect(toast).toHaveBeenCalledWith("Note added.");
  });

  it("submits with Ctrl+Enter", async () => {
    await openPage();
    const box = screen.getByRole("textbox", { name: "Add a note" });
    await userEvent.type(box, "Sent engagement letter");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");

    expect(box).toHaveValue("");
    expect(await screen.findByText("Saving…")).toBeInTheDocument();
  });

  it("asks for text when the note is empty", async () => {
    await openPage();
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(await screen.findByText("Write a note first.")).toBeInTheDocument();
  });

  it("says how long the note is when it is over 1000 characters", async () => {
    await openPage();
    await userEvent.click(screen.getByRole("textbox", { name: "Add a note" }));
    await userEvent.paste("x".repeat(1001));
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(
      await screen.findByText("Notes can be up to 1000 characters. This one has 1001."),
    ).toBeInTheDocument();
  });
});

describe("when a note fails to save", () => {
  it("removes the pending note, puts the text back and shows the failure toast", async () => {
    await openPage();
    setFailureSimulated(true);
    const box = screen.getByRole("textbox", { name: "Add a note" });
    await userEvent.type(box, "Do not lose this");
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));
    await finishRequests();

    expect(await screen.findByDisplayValue("Do not lose this")).toBe(box);
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Note not saved. Your text is still in the box. Try again.");
  });
});

describe("status change", () => {
  it("shows Status changed from Lead to Active. in the timeline", async () => {
    await openPage();
    await userEvent.click(screen.getByRole("button", { name: /Change status/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Move to Active" }));
    await finishRequests();

    expect(await screen.findByText("Status changed from Lead to Active.")).toBeInTheDocument();
  });
});
