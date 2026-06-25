"use client";

import { useEstimate } from "../EstimateProvider";
import {
  type LineItem,
  CSI_DIVISIONS,
  lineTotal,
  estimateSubtotal,
  formatUSD,
} from "@/lib/estimate";
import Link from "next/link";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export default function EstimatePage() {
  const { estimate, setEstimate } = useEstimate();

  const update = (id: string, patch: Partial<LineItem>) =>
    setEstimate({
      ...estimate,
      lineItems: estimate.lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)),
    });

  const remove = (id: string) =>
    setEstimate({ ...estimate, lineItems: estimate.lineItems.filter((li) => li.id !== id) });

  const addBlank = () =>
    setEstimate({
      ...estimate,
      lineItems: [
        ...estimate.lineItems,
        { id: newId(), division: CSI_DIVISIONS[8], description: "", quantity: 0, unit: "SF", unitPrice: 0 },
      ],
    });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
          ← Tools
        </Link>
        <h1 className="text-2xl font-bold">Estimate</h1>
        <span className="ml-auto rounded-full bg-[#15212d] px-3 py-1 text-xs font-semibold text-white">
          10 CENT
        </span>
      </div>

      <label className="mb-6 block">
        <span className="text-sm font-medium text-gray-600">Project name</span>
        <input
          value={estimate.projectName}
          onChange={(e) => setEstimate({ ...estimate, projectName: e.target.value })}
          placeholder="e.g. Maple St. Tenant Improvement"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#15212d] focus:outline-none"
        />
      </label>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2">Division</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2 text-right">Unit $</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {estimate.lineItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  No line items yet. Add one below, or tell the assistant
                  &ldquo;I have 400 sq ft of drywall.&rdquo;
                </td>
              </tr>
            )}
            {estimate.lineItems.map((li) => (
              <tr key={li.id} className="border-t border-gray-100">
                <td className="px-3 py-2">
                  <select
                    value={li.division}
                    onChange={(e) => update(li.id, { division: e.target.value })}
                    className="w-44 rounded border border-gray-200 px-2 py-1"
                  >
                    {CSI_DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    {!CSI_DIVISIONS.includes(li.division as (typeof CSI_DIVISIONS)[number]) && (
                      <option value={li.division}>{li.division}</option>
                    )}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={li.description}
                    onChange={(e) => update(li.id, { description: e.target.value })}
                    className="w-full rounded border border-gray-200 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    value={li.quantity}
                    onChange={(e) => update(li.id, { quantity: Number(e.target.value) })}
                    className="w-20 rounded border border-gray-200 px-2 py-1 text-right"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={li.unit}
                    onChange={(e) => update(li.id, { unit: e.target.value })}
                    className="w-16 rounded border border-gray-200 px-2 py-1"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    value={li.unitPrice}
                    onChange={(e) => update(li.id, { unitPrice: Number(e.target.value) })}
                    className="w-24 rounded border border-gray-200 px-2 py-1 text-right"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">{formatUSD(lineTotal(li))}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => remove(li.id)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Remove line item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td colSpan={5} className="px-3 py-3 text-right font-semibold">
                Subtotal
              </td>
              <td className="px-3 py-3 text-right text-lg font-bold">
                {formatUSD(estimateSubtotal(estimate))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        onClick={addBlank}
        className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        + Add line item
      </button>
    </main>
  );
}
