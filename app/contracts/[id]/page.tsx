// app/contracts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setContract(data))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!contract) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 text-indigo-400 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-2">Contract {contract.id}</h2>
      <p>
        <strong>Region:</strong> {contract.region.name}
      </p>
      <p>
        <strong>Total Premium:</strong> {contract.total_premium}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {contract.is_fulfilled ? "Settled" : "Active"}
      </p>
      <p>
        <strong>Maturity Date:</strong>{" "}
        {new Date(contract.maturity_date).toLocaleDateString()}
      </p>
      <p>
        <strong>Smart Contract:</strong>{" "}
        {contract.smart_contract_address || "N/A"}
      </p>

      <h3 className="mt-6 text-xl font-semibold">Beneficiaries</h3>
      <ul className="list-disc list-inside space-y-1">
        {contract.beneficiaries.map((b: string, i: number) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      {contract.report_info && (
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
    </div>
  );
}
