import { DataProvider }    from "./DataContext";
import { UIProvider }      from "./UIContext";
import { DerivedProvider } from "./DerivedContext";

export const DashboardProvider = ({ children }) => (
  <DataProvider>
    <UIProvider>
      <DerivedProvider>
        {children}
      </DerivedProvider>
    </UIProvider>
  </DataProvider>
);
