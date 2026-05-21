/**
 * Validates that all required fields are present and non-empty in a body object.
 * Returns a string error message if validation fails, or null if all fields are present.
 */
export function requireFields(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || val === "") {
      return `Pflichtfeld fehlt: ${field}`;
    }
  }
  return null;
}
