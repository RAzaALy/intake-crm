import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeContact } from "@/test/factories";
import { EditContact } from "./EditContact";

const refetch = vi.fn();
let queryState: Record<string, unknown> = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ id: "c1" }),
  usePathname: () => "/contacts/c1/edit",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../api/queries", () => ({
  useContact: () => queryState,
  useUpdateContact: () => ({ mutateAsync: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  queryState = {};
});

describe("EditContact states", () => {
  it("shows Contact not found when the id is unknown", () => {
    queryState = { data: null, isPending: false, isError: false, isFetching: false, refetch };
    render(<EditContact />);

    expect(screen.getByRole("heading", { name: "Contact not found" })).toBeInTheDocument();
  });

  it("shows the load error and refetches on Try again", async () => {
    queryState = { data: undefined, isPending: false, isError: true, isFetching: false, refetch };
    render(<EditContact />);

    expect(screen.getByText("This contact didn't load")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows no form while loading", () => {
    queryState = { data: undefined, isPending: true, isError: false, isFetching: true, refetch };
    render(<EditContact />);

    expect(screen.queryByRole("button", { name: "Save contact" })).not.toBeInTheDocument();
  });

  it("prefills the form with the contact, including the attorney", () => {
    const contact = makeContact({
      id: "c1",
      fullName: "Ana Silva",
      email: "ana@example.com",
      matterType: "immigration",
      source: "referral",
      assignedTo: "Priya Raman",
    });
    queryState = { data: { contact }, isPending: false, isError: false, isFetching: false, refetch };
    render(<EditContact />);

    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("Ana Silva");
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("ana@example.com");
    expect(screen.getByRole("combobox", { name: "Matter type" })).toHaveDisplayValue("Immigration");
    expect(screen.getByRole("combobox", { name: /Assigned attorney/ })).toHaveDisplayValue("Priya Raman");
    expect(screen.getByRole("button", { name: "Save contact" })).toBeInTheDocument();
  });

  it("keeps the form when a background refetch fails, so typed edits survive", async () => {
    const contact = makeContact({ id: "c1", fullName: "Ana Silva" });
    queryState = { data: { contact }, isPending: false, isError: false, isFetching: false, refetch };
    const { rerender } = render(<EditContact />);
    const name = screen.getByRole("textbox", { name: "Full name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Ana M. Silva");

    // TanStack keeps the last data when a refetch fails (for example, the demo switch is flipped).
    queryState = { ...queryState, isError: true };
    rerender(<EditContact />);

    expect(screen.queryByText("This contact didn't load")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("Ana M. Silva");
  });
});
