export interface Project {
  id: string;
  name: string;
  /** True when the current user owns the project; false for shared/collaborator projects. */
  isOwner: boolean;
}

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

/** Short random suffix that keeps room IDs unique across same-named projects. */
export function generateSuffix(length = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

/** Project ID and Liveblocks room ID: slugified name + unique suffix. */
export function toRoomId(name: string, suffix: string): string {
  return `${toSlug(name) || FALLBACK_SLUG}-${suffix}`;
}
