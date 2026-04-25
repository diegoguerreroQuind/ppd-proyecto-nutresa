export const DashboardFooter = () => (
  <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
    <span className="text-[11px] text-text-dim">
      Datos de muestra · Conectar a Supabase para datos en vivo
    </span>
    <span className="text-[11px] text-text-dim">
      v3.0 · {new Date().toLocaleDateString("es-CO")}
    </span>
  </div>
);
