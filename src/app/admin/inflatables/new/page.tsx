import { InflatableForm } from "../InflatableForm";

export const dynamic = "force-dynamic";

export default function NewInflatable() {
  return (
    <div>
      <h2 className="text-xl">Add inflatable</h2>
      <div className="mt-4">
        <InflatableForm />
      </div>
    </div>
  );
}
