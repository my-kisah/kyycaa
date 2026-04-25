import sanitizeHtml from "sanitize-html";

export function sanitizeComment(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
