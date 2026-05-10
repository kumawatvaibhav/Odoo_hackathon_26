import { Plus } from "lucide-react";

export function PlanFab() {
  return (
    <a
      href="#signup"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-charcoal text-cream pl-4 pr-5 py-3.5 font-semibold shadow-elegant hover:bg-charcoal/90 hover:scale-105 active:scale-95 transition-all"
    >
      <span className="grid place-items-center w-7 h-7 rounded-full bg-teal text-charcoal">
        <Plus size={16} strokeWidth={2.5} />
      </span>
      Plan a trip
    </a>
  );
}
