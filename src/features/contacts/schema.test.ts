import { describe, expect, it } from "vitest";
import { contactInputSchema, noteBodySchema } from "./schema";

const validInput = {
  fullName: "Amna Siddiqui",
  email: "amna@example.com",
  phone: "+1 (555) 010-4477",
  status: "lead",
  matterType: "family",
  source: "website",
};

/** Returns the first error message for one field, or undefined when the field is valid. */
function errorFor(field: string, value: unknown): string | undefined {
  const result = contactInputSchema.safeParse({ ...validInput, [field]: value });
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("contactInputSchema", () => {
  it("accepts a valid contact and applies defaults", () => {
    const result = contactInputSchema.parse(validInput);
    expect(result.assignedTo).toBeNull();
    expect(result.conflictCheck).toBe("pending");
  });

  it("trims text fields", () => {
    const result = contactInputSchema.parse({
      ...validInput,
      fullName: "  Amna Siddiqui ",
      email: " amna@example.com ",
      phone: " 5550104477 ",
    });
    expect(result.fullName).toBe("Amna Siddiqui");
    expect(result.email).toBe("amna@example.com");
    expect(result.phone).toBe("5550104477");
  });

  it("accepts a known attorney and rejects an unknown one", () => {
    expect(contactInputSchema.safeParse({ ...validInput, assignedTo: "Priya Raman" }).success).toBe(true);
    expect(contactInputSchema.safeParse({ ...validInput, assignedTo: "Someone Else" }).success).toBe(false);
  });

  describe("fullName", () => {
    it("asks for a name when empty or only spaces", () => {
      expect(errorFor("fullName", "")).toBe("Enter the prospective client's full name.");
      expect(errorFor("fullName", "   ")).toBe("Enter the prospective client's full name.");
    });

    it("rejects a single character", () => {
      expect(errorFor("fullName", "A")).toBe("Full name needs at least 2 characters.");
    });

    it("allows 80 characters but not 81", () => {
      expect(errorFor("fullName", "a".repeat(80))).toBeUndefined();
      expect(errorFor("fullName", "a".repeat(81))).toBe("Full name can be up to 80 characters.");
    });
  });

  describe("email", () => {
    it("says required, not invalid, when empty", () => {
      expect(errorFor("email", "")).toBe("Enter an email address.");
    });

    it("rejects a malformed address", () => {
      expect(errorFor("email", "amna@")).toBe("Enter an email like name@firm.com.");
      expect(errorFor("email", "not an email")).toBe("Enter an email like name@firm.com.");
    });
  });

  describe("phone", () => {
    it("asks for a number when empty", () => {
      expect(errorFor("phone", "")).toBe("Enter a phone number.");
    });

    it("rejects letters and other characters", () => {
      expect(errorFor("phone", "555-CALL-NOW")).toBe("Use only digits, spaces, +, - and brackets.");
    });

    it("requires 7 to 20 characters", () => {
      expect(errorFor("phone", "123456")).toBe("Phone number needs 7 to 20 characters.");
      expect(errorFor("phone", "1234567")).toBeUndefined();
      expect(errorFor("phone", "1".repeat(20))).toBeUndefined();
      expect(errorFor("phone", "1".repeat(21))).toBe("Phone number needs 7 to 20 characters.");
    });
  });

  describe("select fields", () => {
    it("asks to choose when status, matter type or source is an empty string", () => {
      expect(errorFor("status", "")).toBe("Choose a status.");
      expect(errorFor("matterType", "")).toBe("Choose a matter type.");
      expect(errorFor("source", "")).toBe("Choose how the inquiry came in.");
    });
  });
});

describe("noteBodySchema", () => {
  it("asks for text when empty or only spaces", () => {
    const result = noteBodySchema.safeParse("   ");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Write a note first.");
  });

  it("trims the note", () => {
    expect(noteBodySchema.parse("  Called back  ")).toBe("Called back");
  });

  it("allows 1000 characters and reports the count when over", () => {
    expect(noteBodySchema.safeParse("a".repeat(1000)).success).toBe(true);

    const result = noteBodySchema.safeParse("a".repeat(1001));
    expect(result.error?.issues[0].message).toBe(
      "Notes can be up to 1000 characters. This one has 1001.",
    );
  });
});
