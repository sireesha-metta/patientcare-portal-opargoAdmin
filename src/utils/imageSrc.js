export function convertBase64ToSrc(base64) {
  if (!base64) return "";
  const type = String(base64).startsWith("iVBOR") ? "png" : "jpeg";
  return `data:image/${type};base64,${base64}`;
}

export function fileToRawBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
