import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicateEmailError } from "../api/repository";
import { NEW_CONTACT_VALUES } from "../formValues";
import { ContactForm } from "./ContactForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/contacts/new",
  useSearchParams: () => new URLSearchParams(),
}));

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <ContactForm variant="create" defaultValues={NEW_CONTACT_VALUES} cancelHref="/contacts" onSubmit={onSubmit} />,
  );
  return onSubmit;
}

/** Fills every required field with valid values. */
async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: "Full name" }), "  Ana Silva  ");
  await user.type(screen.getByRole("textbox", { name: "Email" }), "ana@example.com");
  await user.type(screen.getByRole("textbox", { name: "Phone" }), "+1 555 010 4477");
  await user.selectOptions(screen.getByRole("combobox", { name: "Matter type" }), "Family");
  await user.selectOptions(screen.getByRole("combobox", { name: "Source" }), "Website");
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("ContactForm validation", () => {
  it("shows every required error on an empty submit and focuses Full name", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(screen.getByText("Enter the prospective client's full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter an email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter a phone number.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Matter type" })).toBeInvalid();
    expect(screen.getByRole("combobox", { name: "Source" })).toBeInvalid();
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveFocus();
  });

  it("moves focus to Email, the first invalid field, after Full name is fixed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Create contact" }));
    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana Silva");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus();
  });

  it("announces how many fields need fixing", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Create contact" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("5 fields need fixing before you can save."),
    );
  });

  it("shows an error on blur, not before", async () => {
    const user = userEvent.setup();
    renderForm();
    const email = screen.getByRole("textbox", { name: "Email" });

    await user.type(email, "not-an-email");
    expect(screen.queryByText("Enter an email like name@firm.com.")).not.toBeInTheDocument();

    await user.tab();
    expect(screen.getByText("Enter an email like name@firm.com.")).toBeInTheDocument();
  });
});

describe("ContactForm submit", () => {
  it("calls onSubmit with trimmed values and a null attorney when Unassigned", async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      fullName: "Ana Silva",
      email: "ana@example.com",
      phone: "+1 555 010 4477",
      status: "lead",
      matterType: "family",
      source: "website",
      assignedTo: null,
      conflictCheck: "pending",
    });
  });

  it("shows Creating… and a disabled button while saving, and cannot be submitted twice", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise<void>(() => {}));
    renderForm(onSubmit);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    const busy = await screen.findByRole("button", { name: "Creating…" });
    expect(busy).toBeDisabled();

    await user.click(busy);
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("marks Cancel as disabled while saving", async () => {
    const user = userEvent.setup();
    renderForm(vi.fn(() => new Promise<void>(() => {})));

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(await screen.findByRole("link", { name: "Cancel" })).toHaveAttribute("aria-disabled", "true");
  });
});

describe("ContactForm save errors", () => {
  it("shows the duplicate email error on Email and focuses it", async () => {
    const user = userEvent.setup();
    renderForm(vi.fn().mockRejectedValue(new DuplicateEmailError()));

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(await screen.findByText("Another contact already uses this email.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus());
  });

  it("shows a Not saved alert, keeps typed values and re-enables the button on any other error", async () => {
    const user = userEvent.setup();
    renderForm(vi.fn().mockRejectedValue(new Error("boom")));

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Not saved");
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveValue("ana@example.com");
    const submit = screen.getByRole("button", { name: "Create contact" });
    expect(submit).toBeEnabled();
    await waitFor(() => expect(submit).toHaveFocus());
  });
});

describe("ContactForm Cancel", () => {
  it("does not open the dialog when nothing was changed", async () => {
    const user = userEvent.setup();
    renderForm();
    // jsdom cannot navigate; swallow the link's default so the run stays quiet.
    document.addEventListener("click", (event) => event.preventDefault(), { once: true });

    await user.click(screen.getByRole("link", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("opens the leave dialog after an edit, with focus on Keep editing", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana");
    await user.click(screen.getByRole("link", { name: "Cancel" }));

    expect(await screen.findByRole("alertdialog", { name: "Leave without saving?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep editing" })).toHaveFocus();
  });

  it("goes to the cancel link when changes are discarded", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana");
    await user.click(screen.getByRole("link", { name: "Cancel" }));
    await user.click(await screen.findByRole("button", { name: "Discard changes" }));

    expect(push).toHaveBeenCalledWith("/contacts");
  });

  it("closes the dialog and stays put on Keep editing", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Ana");
    await user.click(screen.getByRole("link", { name: "Cancel" }));
    await user.click(await screen.findByRole("button", { name: "Keep editing" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
