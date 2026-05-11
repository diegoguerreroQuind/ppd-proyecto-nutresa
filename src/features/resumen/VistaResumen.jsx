import { useDashboard } from "../../context/useDashboard";
import { EjecucionCard }       from "./components/EjecucionCard";
import { HabilesVsFinSemana }  from "./components/HabilesVsFinSemana";
import { AlertasTable }        from "./components/AlertasTable";

export const VistaResumen = () => {
  const { ejFilter, filtered, kpis, banda, anotacionesData } = useDashboard();
  const ejecuciones = ejFilter === "ambos" ? ["EJ1", "EJ2"] : [ejFilter];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        {ejecuciones.map((ej) => (
          <EjecucionCard key={ej} ej={ej} kpis={kpis} />
        ))}
      </div>
      <HabilesVsFinSemana filtered={filtered} banda={banda} />
      <AlertasTable filtered={filtered} banda={banda} anotaciones={anotacionesData ?? []} />
    </div>
  );
};
