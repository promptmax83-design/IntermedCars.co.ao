export type VehicleStatus =
  "disponivel" | "em_negociacao" | "comprado" | "cancelado";

interface StatusBadgeProps {
  status: VehicleStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  VehicleStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  disponivel: {
    label: "Disponivel",
    bg: "bg-[#10b981]/10",
    text: "text-[#10b981]",
    dot: "bg-[#10b981]",
  },
  em_negociacao: {
    label: "Em Negociacao",
    bg: "bg-[#f59e0b]/10",
    text: "text-[#f59e0b]",
    dot: "bg-[#f59e0b]",
  },
  comprado: {
    label: "Vendido",
    bg: "bg-[#52525b]/10",
    text: "text-slate-500",
    dot: "bg-[#a1a1aa]",
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-[#ef4444]/10",
    text: "text-[#ef4444]",
    dot: "bg-[#ef4444]",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
          status === "em_negociacao" ? "animate-pulse-soft" : ""
        }`}
      />
      {config.label}
    </span>
  );
}
