import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InflatableForm } from "../InflatableForm";

export const dynamic = "force-dynamic";

export default async function EditInflatable({ params }: { params: { id: string } }) {
  const inflatable = await prisma.inflatable.findUnique({ where: { id: params.id } });
  if (!inflatable) notFound();
  return (
    <div>
      <h2 className="text-xl">Edit {inflatable.name}</h2>
      <div className="mt-4">
        <InflatableForm inflatable={inflatable} />
      </div>
    </div>
  );
}
