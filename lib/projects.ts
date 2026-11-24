export interface Project {
  id: string;
  name: string;
  slug: string;
  /** True when the current user owns the project; false for shared/collaborator projects. */
  isOwner: boolean;
}

/** Mock data only — replaced once the API and persistence exist. */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Payments Platform",
    slug: "payments-platform",
    isOwner: true,
  },
  {
    id: "p2",
    name: "Realtime Chat Backend",
    slug: "realtime-chat-backend",
    isOwner: true,
  },
  {
    id: "p3",
    name: "Analytics Pipeline",
    slug: "analytics-pipeline",
    isOwner: false,
  },
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const FALLBACK_SLUG = "project";

/** Slug for a project name; never empty for a non-blank name (e.g. Unicode-only names). */
export function toSlug(name: string): string {
  return name.trim() ? slugify(name) || FALLBACK_SLUG : "";
}
