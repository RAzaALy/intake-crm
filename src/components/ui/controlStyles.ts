/** Shared look for Input, Textarea and Select. 16px text on phones so iOS does not zoom. */
export const controlStyles =
  "w-full rounded-control border border-line-input bg-surface px-3 text-base text-ink md:text-body " +
  "transition-colors duration-150 ease-out " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-muted " +
  "aria-[invalid=true]:border-danger";
