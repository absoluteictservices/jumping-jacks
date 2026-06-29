import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// One-time helper: pull each inflatable's existing (WordPress) image into Vercel
// Blob so the site no longer depends on the old site. Idempotent — already-migrated
// blob URLs are left alone. Owner triggers it from the admin (must be logged in).
async function handle() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized — log in to /admin first." }, { status: 401 });
  }

  const inflatables = await prisma.inflatable.findMany();
  const results: { name: string; status: string }[] = [];

  for (const inf of inflatables) {
    const newImages: string[] = [];
    let changed = false;

    for (const url of inf.images) {
      // Skip already-migrated blob URLs and any non-http values.
      if (url.includes("blob.vercel-storage.com") || !/^https?:\/\//i.test(url)) {
        newImages.push(url);
        continue;
      }
      try {
        const res = await fetch(url, { redirect: "follow" });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.startsWith("image/")) {
          newImages.push(url); // keep original; couldn't fetch a real image
          results.push({ name: inf.name, status: `skipped (${res.status} ${ct || "no type"})` });
          continue;
        }
        const buf = Buffer.from(await res.arrayBuffer());
        const ext = (ct.split("/")[1] || "jpg").split(";")[0];
        const blob = await put(`castles/${inf.slug}-${newImages.length + 1}.${ext}`, buf, {
          access: "public",
          contentType: ct,
          addRandomSuffix: true,
        });
        newImages.push(blob.url);
        changed = true;
        results.push({ name: inf.name, status: "migrated" });
      } catch (e) {
        newImages.push(url);
        results.push({ name: inf.name, status: `error: ${(e as Error).message}` });
      }
    }

    if (changed) {
      await prisma.inflatable.update({ where: { id: inf.id }, data: { images: newImages } });
    }
  }

  const migrated = results.filter((r) => r.status === "migrated").length;
  const skipped = results.filter((r) => r.status !== "migrated").length;
  return NextResponse.json({ done: true, migrated, skipped, results });
}

export const GET = handle;
export const POST = handle;
