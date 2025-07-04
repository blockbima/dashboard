// app/contracts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldIdx, setFieldIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setContract(data))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="p-6 text-red-400">Error fetching contract: {error}</div>;
  }
  if (!contract) {
    return <div className="p-6 text-gray-100">Loading contract details...</div>;
  }

  // Prepare raw fields for slider
  const rawEntries = Object.entries(contract);
  const totalFields = rawEntries.length;
  const [keyName, keyValue] = rawEntries[fieldIdx] || ["", ""];

  // Explorer URL builder
  const explorerBase = "https://explorer.testnet.xrplevm.org/address";
  const addr = contract.smart_contract_address;
  const explorerUrl = addr
    ? `${explorerBase}/${addr}?tab=index`
    : null;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 text-indigo-400 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-2">Contract {contract.id}</h2>
      <p><strong>Region:</strong> {contract.region.name}</p>
      <p><strong>Total Premium:</strong> {contract.total_premium}</p>
      <p><strong>Status:</strong> {contract.is_fulfilled ? "Settled" : "Active"}</p>
      <p>
        <strong>Maturity Date:</strong>{" "}
        {new Date(contract.maturity_date).toLocaleDateString()}
      </p>
      <p>
        <strong>Smart Contract:</strong>{" "}
        {addr ? (
          <a
            href={explorerUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 underline"
          >
            {addr}
          </a>
        ) : (
          "N/A"
        )}
      </p>

      <h3 className="mt-6 text-xl font-semibold">Beneficiaries</h3>
      <ul className="list-disc list-inside space-y-1">
        {contract.beneficiaries.map((b: string, i: number) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      {Array.isArray(contract.report_info?.daily_data) && contract.report_info.daily_data.length > 0 && (
        <>
          <h3 className="mt-6 text-xl font-semibold">Report Info</h3>
          <table className="min-w-full border mt-2">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Reported Value</th>
                <th className="p-2 text-left">Calculated Payout</th>
              </tr>
            </thead>
            <tbody>
              {contract.report_info.daily_data.map((d: any) => (
                <tr key={d.date} className="border-t border-gray-700">
                  <td className="p-2">{d.date}</td>
                  <td className="p-2">{d.reported_value}</td>
                  <td className="p-2">{d.calculated_payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Raw Data Slider */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">All Contract Fields</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFieldIdx((i) => Math.max(0, i - 1))}
            disabled={fieldIdx === 0}
            className="px-3 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-2 text-left">Key</th>
                  <th className="p-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-2 font-mono">{keyName}</td>
                  <td className="p-2 font-mono">{JSON.stringify(keyValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setFieldIdx((i) => Math.min(totalFields - 1, i + 1))}
            disabled={fieldIdx === totalFields - 1}
            className="px-3 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="mt-1 text-sm text-gray-400">
          Showing {fieldIdx + 1} of {totalFields}
        </div>
      </div>
    </div>
  );
}
