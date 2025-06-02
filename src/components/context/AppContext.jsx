"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [timePeriod, setTimePeriod] = useState("L30D");

  useEffect(() => {
    console.log("Time period updated:", timePeriod);
  }, [timePeriod]);

  return (
    <AppContext.Provider value={{ timePeriod, setTimePeriod }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
