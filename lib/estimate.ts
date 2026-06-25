// Shared estimate data model — used by both the UI (client) and the assistant
// backend (server). Keep this file free of server-only imports.

export type LineItem = {
  id: string;
  division: string; // CSI division, e.g. "09 - Finishes"
  description: string;
  quantity: number;
  unit: string; // SF, LF, EA, CY, HR, LS, ...
  unitPrice: number;
};

export type Estimate = {
  projectName: string;
  lineItems: LineItem[];
};

export const emptyEstimate = (): Estimate => ({ projectName: "", lineItems: [] });

export const lineTotal = (li: LineItem): number => li.quantity * li.unitPrice;

export const estimateSubtotal = (e: Estimate): number =>
  e.lineItems.reduce((sum, li) => sum + lineTotal(li), 0);

export const formatUSD = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// Common CSI MasterFormat divisions used to organize a construction estimate.
export const CSI_DIVISIONS = [
  "01 - General Requirements",
  "02 - Existing Conditions",
  "03 - Concrete",
  "04 - Masonry",
  "05 - Metals",
  "06 - Wood, Plastics & Composites",
  "07 - Thermal & Moisture Protection",
  "08 - Openings (Doors & Windows)",
  "09 - Finishes",
  "10 - Specialties",
  "11 - Equipment",
  "12 - Furnishings",
  "21 - Fire Suppression",
  "22 - Plumbing",
  "23 - HVAC",
  "26 - Electrical",
  "31 - Earthwork",
  "32 - Exterior Improvements",
  "33 - Utilities",
] as const;
