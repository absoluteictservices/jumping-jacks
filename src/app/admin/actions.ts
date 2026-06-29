"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkPassword, createSessionCookie, destroySessionCookie, isAuthenticated } from "@/lib/auth";
import { parsePoundsToPence } from "@/lib/money";
import { dateKeyToUTCDate, dbDateToKey, formatDisplay } from "@/lib/dates";
import { CATALOGUE, CANCELLATION_POLICY } from "@/lib/catalogue";
import { nextInvoiceNumber, type LineItem } from "@/lib/invoices";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function guard() {
  if (!isAuthenticated()) throw new Error("Unauthorized");
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    redirect("/admin?error=1");
  }
  createSessionCookie();
  redirect("/admin");
}

export async function logout() {
  destroySessionCookie();
  redirect("/admin");
}

// ── Inflatables ─────────────────────────────────────────────
export async function saveInflatable(formData: FormData) {
  guard();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const data = {
    name,
    description: String(formData.get("description") ?? "").trim(),
    theme: emptyToNull(formData.get("theme")),
    dimensions: emptyToNull(formData.get("dimensions")),
    ageSuitability: emptyToNull(formData.get("ageSuitability")),
    pricePerDay: parsePoundsToPence(String(formData.get("pricePerDay") ?? "")),
    images: String(formData.get("images") ?? "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };

  if (id) {
    await prisma.inflatable.update({ where: { id }, data });
  } else {
    await prisma.inflatable.create({ data: { ...data, slug: slugify(name) || `castle-${Date.now()}` } });
  }
  revalidatePath("/admin/inflatables");
  revalidatePath("/castles");
  redirect("/admin/inflatables");
}

// One-click first-time setup: loads the 20-castle starter catalogue + default
// settings. Only runs when there are no inflatables yet, so it's safe to click.
export async function seedCatalogue() {
  guard();
  const count = await prisma.inflatable.count();
  if (count === 0) {
    for (const inf of CATALOGUE) {
      await prisma.inflatable.create({ data: inf });
    }
    await prisma.settings.upsert({
      where: { id: "singleton" },
      update: { cancellationPolicy: CANCELLATION_POLICY },
      create: { id: "singleton", cancellationPolicy: CANCELLATION_POLICY, deliveryPostcodePrefixes: ["LS"] },
    });
  }
  revalidatePath("/admin/inflatables");
  revalidatePath("/castles");
  revalidatePath("/");
  redirect("/admin/inflatables");
}

export async function toggleInflatable(formData: FormData) {
  guard();
  const id = String(formData.get("id"));
  const inf = await prisma.inflatable.findUnique({ where: { id } });
  if (inf) {
    await prisma.inflatable.update({ where: { id }, data: { active: !inf.active } });
  }
  revalidatePath("/admin/inflatables");
  revalidatePath("/castles");
}

// ── Bookings ────────────────────────────────────────────────
export async function cancelBooking(formData: FormData) {
  guard();
  const id = String(formData.get("id"));
  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

// ── Blackout dates ──────────────────────────────────────────
export async function addBlackout(formData: FormData) {
  guard();
  const date = String(formData.get("date") ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    await prisma.blackoutDate.upsert({
      where: { date: dateKeyToUTCDate(date) },
      update: { reason: emptyToNull(formData.get("reason")) ?? undefined },
      create: { date: dateKeyToUTCDate(date), reason: emptyToNull(formData.get("reason")) },
    });
  }
  revalidatePath("/admin/blackouts");
}

export async function removeBlackout(formData: FormData) {
  guard();
  const id = String(formData.get("id"));
  await prisma.blackoutDate.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/blackouts");
}

// ── Settings ────────────────────────────────────────────────
export async function saveSettings(formData: FormData) {
  guard();
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: settingsFromForm(formData),
    create: { id: "singleton", ...settingsFromForm(formData) },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  redirect("/admin/settings?saved=1");
}

function settingsFromForm(formData: FormData) {
  return {
    maxDeliveriesPerDay: Math.max(1, Number(formData.get("maxDeliveriesPerDay") ?? 1) || 1),
    minLeadTimeDays: Math.max(0, Number(formData.get("minLeadTimeDays") ?? 1) || 0),
    holdMinutes: Math.max(5, Number(formData.get("holdMinutes") ?? 15) || 15),
    deliveryPostcodePrefixes: String(formData.get("deliveryPostcodePrefixes") ?? "")
      .split(/[\n,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
    companyEmail: String(formData.get("companyEmail") ?? "").trim() || "info@jumpingjacksleeds.co.uk",
    companyPhone: String(formData.get("companyPhone") ?? "").trim() || "07769781666",
    cancellationPolicy: String(formData.get("cancellationPolicy") ?? "").trim(),
    companyAddress: String(formData.get("companyAddress") ?? "").trim(),
  };
}

// ── Invoices ────────────────────────────────────────────────
export async function createInvoiceFromBooking(formData: FormData) {
  guard();
  const bookingId = String(formData.get("bookingId"));
  const existing = await prisma.invoice.findUnique({ where: { bookingId } });
  if (existing) redirect(`/admin/invoices/${existing.id}`);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { inflatable: true },
  });
  if (!booking) redirect("/admin/bookings");

  const lineItems: LineItem[] = [
    {
      description: `${booking.inflatable.name} — full day hire on ${formatDisplay(dbDateToKey(booking.date))}`,
      amountPence: booking.totalPence,
    },
  ];
  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      customerName: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      address: `${booking.deliveryAddress}, ${booking.deliveryPostcode}`,
      lineItems,
      totalPence: booking.totalPence,
      bookingId: booking.id,
    },
  });
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function createCustomInvoice(formData: FormData) {
  guard();
  let items: LineItem[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("lineItems") ?? "[]"));
    if (Array.isArray(parsed)) {
      items = parsed
        .map((x) => ({
          description: String(x?.description ?? "").trim(),
          amountPence: parsePoundsToPence(String(x?.amount ?? "")) ?? 0,
        }))
        .filter((x) => x.description !== "");
    }
  } catch {
    items = [];
  }
  if (items.length === 0) {
    items = [{ description: "Bouncy castle hire", amountPence: 0 }];
  }
  const total = items.reduce((s, i) => s + i.amountPence, 0);

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      customerName: String(formData.get("customerName") ?? "Customer").trim() || "Customer",
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
      address: emptyToNull(formData.get("address")),
      lineItems: items,
      totalPence: total,
      notes: emptyToNull(formData.get("notes")),
    },
  });
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${invoice.id}`);
}

export async function deleteInvoice(formData: FormData) {
  guard();
  const id = String(formData.get("id"));
  await prisma.invoice.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/invoices");
  redirect("/admin/invoices");
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}
