import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CONFLICT_LABELS, MATTER_LABELS, SOURCE_LABELS, STATUS_LABELS, UNASSIGNED_LABEL } from "../labels";
import {
  ATTORNEYS,
  CONFLICT_CHECKS,
  CONTACT_STATUSES,
  MATTER_TYPES,
  SOURCES,
  type ContactFormValues,
} from "../schema";

type ContactFormFieldsProps = {
  register: UseFormRegister<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
};

function Section({ legend, children }: { legend: string; children: ReactNode }) {
  // The panel border sits on a wrapper, because a bordered <fieldset> draws its legend on the line.
  return (
    <div className="rounded-panel border border-line bg-surface p-4 md:p-6">
      <fieldset className="min-w-0">
        <legend className="mb-4 text-base font-semibold text-ink">{legend}</legend>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </fieldset>
    </div>
  );
}

/**
 * The two fieldsets, in DOM order. React Hook Form focuses the first invalid field it
 * registered, so this order is also the order errors are visited in.
 */
export function ContactFormFields({ register, errors }: ContactFormFieldsProps) {
  return (
    <>
      <Section legend="Prospective client">
        <div className="md:col-span-2">
          <Field label="Full name" hint="As the prospective client gives it." error={errors.fullName?.message}>
            {/* autoComplete off: the browser would offer the coordinator's own details. */}
            {(control) => <Input {...control} {...register("fullName")} autoComplete="off" />}
          </Field>
        </div>
        <Field label="Email" error={errors.email?.message}>
          {(control) => (
            <Input
              {...control}
              {...register("email")}
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="name@firm.com"
            />
          )}
        </Field>
        <Field label="Phone" hint="Digits, spaces, +, - and brackets are fine." error={errors.phone?.message}>
          {(control) => (
            <Input {...control} {...register("phone")} type="tel" autoComplete="off" placeholder="+1 555 010 4477" />
          )}
        </Field>
      </Section>

      <Section legend="Matter and routing">
        <Field label="Matter type" error={errors.matterType?.message}>
          {(control) => (
            <Select {...control} {...register("matterType")}>
              <option value="">
                Choose a matter type
              </option>
              {MATTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MATTER_LABELS[type]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Source" hint="How the inquiry reached the firm." error={errors.source?.message}>
          {(control) => (
            <Select {...control} {...register("source")}>
              <option value="">
                Choose a source
              </option>
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Status" hint="New inquiries usually start as Lead." error={errors.status?.message}>
          {(control) => (
            <Select {...control} {...register("status")}>
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          label="Assigned attorney"
          optional
          hint="Leave as Unassigned until an attorney takes the matter."
          error={errors.assignedTo?.message}
        >
          {(control) => (
            // A <select> only holds strings, so "Unassigned" is "" in the DOM and null in the data.
            <Select
              {...control}
              {...register("assignedTo", { setValueAs: (value: string) => (value === "" ? null : value) })}
            >
              <option value="">{UNASSIGNED_LABEL}</option>
              {ATTORNEYS.map((attorney) => (
                <option key={attorney} value={attorney}>
                  {attorney}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field
          label="Conflict check"
          optional
          hint="Leave as Pending until the check is run."
          error={errors.conflictCheck?.message}
        >
          {(control) => (
            <Select {...control} {...register("conflictCheck")}>
              {CONFLICT_CHECKS.map((check) => (
                <option key={check} value={check}>
                  {CONFLICT_LABELS[check]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Section>
    </>
  );
}
