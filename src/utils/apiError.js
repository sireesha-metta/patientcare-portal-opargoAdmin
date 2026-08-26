export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.response?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function unwrapResponse(payload) {
  return payload?.response ?? payload ?? {};
}

export function getResponseMessage(data) {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data.response === "string") return data.response;
  return data.response?.message || data.message || "";
}

export function toTitleCase(value) {
  if (value == null || value === "") return "";
  return String(value).replace(/\b\w/g, (char) => char.toUpperCase());
}
