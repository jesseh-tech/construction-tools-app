"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type Estimate, emptyEstimate } from "@/lib/estimate";

type EstimateContextValue = {
  estimate: Estimate;
  setEstimate: (e: Estimate) => void;
};

const EstimateContext = createContext<EstimateContextValue | null>(null);

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [estimate, setEstimate] = useState<Estimate>(emptyEstimate());
  return (
    <EstimateContext.Provider value={{ estimate, setEstimate }}>
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate(): EstimateContextValue {
  const ctx = useContext(EstimateContext);
  if (!ctx) throw new Error("useEstimate must be used within an EstimateProvider");
  return ctx;
}
