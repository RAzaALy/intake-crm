import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeContact } from "@/test/factories";
import type { Contact } from "../schema";
import { ContactList } from "./ContactList";

const refetch = vi.fn();
let queryState: Record<string, unknown> = {};

// The list writes the URL with history.replaceState, so the mock reads the real jsdom URL.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/contacts",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function setUrl(search: string) {
  window.history.replaceState(null, "", search ? `/contacts?${search}` : "/contacts");
}

vi.mock("../api/queries", () => ({
  useContacts: () => queryState,
}));

function loaded(contacts: Contact[]) {
  queryState = { data: contacts, isPending: false, isError: false, isFetching: false, refetch };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  setUrl("");
});

describe("ContactList states", () => {
  it("shows the empty state with a New contact link when there are no contacts", () => {
    loaded([]);
    render(<ContactList />);

    expect(screen.getByText("No contacts yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New contact" })).toHaveAttribute("href", "/contacts/new");
  });

  it("names the query and status when nothing matches, and clears both but keeps sort", async () => {
    loaded([makeContact({ status: "lead" })]);
    setUrl("q=zzz&status=closed&sort=name");
    render(<ContactList />);

    expect(screen.getByText('No contacts match "zzz" in Closed.')).toBeInTheDocument();
    expect(screen.getByText("Check the spelling, or search by email or phone instead.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(window.location.pathname + window.location.search).toBe("/contacts?sort=name");
  });

  it("clears to plain /contacts when sort is the default", async () => {
    loaded([makeContact({ status: "lead" })]);
    setUrl("q=zzz&status=closed");
    render(<ContactList />);

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(window.location.pathname + window.location.search).toBe("/contacts");
  });

  it("shows a status-only message without the spelling hint", () => {
    loaded([makeContact({ status: "lead" })]);
    setUrl("status=closed");
    render(<ContactList />);

    expect(screen.getByText("No contacts in Closed.")).toBeInTheDocument();
    expect(screen.queryByText(/Check the spelling/)).not.toBeInTheDocument();
  });

  it("shows the error state and retries on Try again", async () => {
    queryState = { data: undefined, isPending: false, isError: true, isFetching: false, refetch };
    render(<ContactList />);

    expect(screen.getByText("Contacts didn't load")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("announces loading while pending", () => {
    queryState = { data: undefined, isPending: true, isError: false, isFetching: true, refetch };
    render(<ContactList />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading contacts…");
  });

  it("uses singular and plural chip names", () => {
    loaded([
      makeContact({ status: "lead" }),
      makeContact({ status: "active" }),
      makeContact({ status: "active" }),
    ]);
    render(<ContactList />);

    expect(screen.getByRole("button", { name: "Lead, 1 contact" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Active, 2 contacts" })).toBeInTheDocument();
  });
});

describe("SearchBox debounce", () => {
  it("updates the URL once after typing stops, not per keystroke", async () => {
    loaded([makeContact()]);
    render(<ContactList />);

    const replaceState = vi.spyOn(window.history, "replaceState");

    await userEvent.type(screen.getByRole("searchbox", { name: "Search contacts" }), "amna");
    expect(replaceState).not.toHaveBeenCalled();

    await waitFor(() => expect(replaceState).toHaveBeenCalledTimes(1));
    expect(replaceState).toHaveBeenCalledWith(null, "", "/contacts?q=amna");
    replaceState.mockRestore();
  });

  it("keeps a chip clicked while the search debounce is still waiting", async () => {
    loaded([makeContact({ status: "lead" })]);
    render(<ContactList />);

    await userEvent.type(screen.getByRole("searchbox", { name: "Search contacts" }), "an");
    await userEvent.click(screen.getByRole("button", { name: "Lead, 1 contact" }));

    await waitFor(() => expect(window.location.search).toBe("?q=an&status=lead"));
  });
});
