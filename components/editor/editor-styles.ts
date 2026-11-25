// Editor-specific styling layered on top of the foundation UI components.
// Includes the `dark:` overrides because the app always renders in dark mode
// and the foundation variants define their own `dark:` backgrounds.
export const brandButton =
  "bg-brand text-primary-foreground hover:bg-brand hover:text-primary-foreground";

export const brandGhostButton =
  "text-brand hover:bg-brand/10 hover:text-brand aria-expanded:bg-brand/10 aria-expanded:text-brand dark:hover:bg-brand/10";

export const blackButton =
  "border-transparent bg-black text-white hover:bg-brand hover:text-primary-foreground dark:border-transparent dark:bg-black dark:hover:bg-brand";

export const brandInput =
  "text-foreground focus-visible:border-brand focus-visible:ring-brand/40";
