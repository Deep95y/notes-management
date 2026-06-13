export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getPreview(content, maxLength = 120) {
  if (!content) return "No content";
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}
