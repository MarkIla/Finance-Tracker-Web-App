"use client";
import { api } from "../app/lib/api";

export default function ReceiptUploader({
  onDone,
}: {
  onDone: (key: string) => void;
}) {
  async function handle(file: File) {
    const { data } = await api.post("/files/presign-upload", null, {
      params: { filename: file.name, mime: file.type },
    });
    await fetch(data.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    onDone(data.key);
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files && handle(e.target.files[0])}
    />
  );
}
