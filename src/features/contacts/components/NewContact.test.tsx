import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeContact } from "@/test/factories";
import { NewContact } from "./NewContact";

const push = vi.fn();
const mutateAsync = vi.fn();
const toast = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/contacts/new",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../api/queries", () => ({
  useCreateContact: () => ({ mutateAsync }),
}));

vi.mock("sonner", () => ({ toast: (message: string) => toast(message) }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("NewContact", () => {
  it("creates the contact, shows a toast and opens the new contact", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue(makeContact({ id: "abc", fullName: "Ana Silva" }));
    render(<NewContact />);

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana Silva");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ana@example.com");
    await user.type(screen.getByRole("textbox", { name: "Phone" }), "+1 555 010 4477");
    await user.selectOptions(screen.getByRole("combobox", { name: "Matter type" }), "Family");
    await user.selectOptions(screen.getByRole("combobox", { name: "Source" }), "Website");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/contacts/abc"));
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ fullName: "Ana Silva", assignedTo: null }));
    expect(toast).toHaveBeenCalledWith("Ana Silva added to contacts.");
  });

  it("does not navigate or toast when the save fails", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValue(new Error("boom"));
    render(<NewContact />);

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana Silva");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ana@example.com");
    await user.type(screen.getByRole("textbox", { name: "Phone" }), "+1 555 010 4477");
    await user.selectOptions(screen.getByRole("combobox", { name: "Matter type" }), "Family");
    await user.selectOptions(screen.getByRole("combobox", { name: "Source" }), "Website");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(await screen.findByText("Not saved")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
  });
});
