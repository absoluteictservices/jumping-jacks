"use client";

import { useState, type ChangeEvent } from "react";

/**
 * Photo manager for the inflatable admin form. Uploads images to Vercel Blob via
 * /api/admin/upload and keeps the list in a hidden field named "images" (newline
 * separated) which the saveInflatable server action already parses.
 */
export function ImagesField({ defaultImages = [] }: { defaultImages?: string[] }) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setImages((prev) => [...prev, data.url as string]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold text-brand-ink/80">Photos</label>
      <input type="hidden" name="images" value={images.join("\n")} />

      {images.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={url + i} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-sm text-white"
                aria-label="Remove photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-violet/10 px-4 py-2 text-sm font-bold text-brand-purple hover:bg-brand-violet/20">
        {busy ? "Uploading…" : "+ Upload photo"}
        <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="hidden" />
      </label>
      <p className="mt-1 text-xs text-brand-ink/50">Upload from your computer or phone. The first photo is used as the main image.</p>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

/** One-time button to pull existing WordPress photos into Vercel Blob. */
export function MigrateButton() {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("running");
    setMsg("");
    try {
      const res = await fetch("/api/admin/migrate-images", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Imported ${data.migrated} photo(s) from the old site.${data.skipped ? ` ${data.skipped} couldn't be fetched — upload those manually.` : ""}`);
      setState("done");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
      setState("error");
    }
  }

  return (
    <div className="text-right">
      <button type="button" onClick={run} disabled={state === "running"} className="btn-secondary !py-2 text-sm">
        {state === "running" ? "Importing…" : "Import photos from old site"}
      </button>
      {msg && (
        <p className={`mt-1 text-xs ${state === "error" ? "text-red-600" : "text-brand-ink/60"}`}>{msg}</p>
      )}
    </div>
  );
}
