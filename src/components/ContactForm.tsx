"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to send");
      }
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl">🎉</div>
        <p className="mt-2 font-bold text-brand-ink">Thanks — your message is on its way!</p>
        <p className="mt-1 text-sm text-brand-ink/70">We'll get back to you as soon as we can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" label="Your name" required />
        <Input name="phone" label="Phone" type="tel" />
        <div className="sm:col-span-2">
          <Input name="email" label="Email" type="email" required />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-brand-ink/80">Message <span className="text-brand-pink">*</span></label>
        <textarea id="message" name="message" rows={4} required className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30" />
      </div>
      {status === "error" && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Input({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-brand-ink/80">
        {label}{required && <span className="text-brand-pink"> *</span>}
      </label>
      <input id={name} name={name} type={type} required={required} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30" />
    </div>
  );
}
