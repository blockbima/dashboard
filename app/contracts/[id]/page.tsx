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

  const pageSize = 5;
  const [beneficiaryPage, setBeneficiaryPage] = useState(1);

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
    return (
      <div className="text-red-500 p-4">
        <p>Error loading contract: {error}</p>
        <button onClick={() => router.refresh()}>Retry</button>
      </div>
    );
  }

  if (!contract) {
    return <div className="p-4 text-gray-400">Loading...</div>;
  }

  const totalBeneficiaryPages = Math.ceil(
    (contract.beneficiaries?.length || 0) / pageSize
  );

  const displayedBeneficiaries = (contract.beneficiaries || []).slice(
    (beneficiaryPage - 1) * pageSize,
    beneficiaryPage * pageSize
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{contract.name}</h1>

      <div className="mb-4 text-sm text-gray-300">
        <p>Location: {contract.region?.name}</p>
        <p>Start Date: {contract.start_date?.split("T")[0]}</p>
        <p>End Date: {contract.end_date?.split("T")[0]}</p>
        <p>Status: {contract.status}</p>
        <p>Contract Address: 
          <a
            href={`https://blockexplorer.com/address/${contract.smart_contract_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline ml-1"
          >
            {contract.smart_contract_address}
          </a>
        </p>
        <p>Transaction Hash:
          <a
            href={`https://blockexplorer.com/tx/${contract.transaction_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline ml-1"
          >
            {contract.transaction_hash}
          </a>
        </p>
      </div>

      <h2 className="text-xl font-semibold mt-6">Beneficiaries</h2>
      <table className="min-w-full border mt-2">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Phone</th>
            <th className="p-2 text-left">Wallet</th>
          </tr>
        </thead>
        <tbody>
          {displayedBeneficiaries.map((b: any, idx: number) => (
            <tr key={idx} className="border-t border-gray-700">
              <td className="p-2">{b.name}</td>
              <td className="p-2">{b.phone}</td>
              <td className="p-2">{b.wallet}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <button
          onClick={() => setBeneficiaryPage((p) => Math.max(1, p - 1))}
          disabled={beneficiaryPage === 1}
          className="px-2 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {beneficiaryPage} of {totalBeneficiaryPages}
        </span>
        <button
          onClick={() => setBeneficiaryPage((p) => Math.min(totalBeneficiaryPages, p + 1))}
          disabled={beneficiaryPage === totalBeneficiaryPages}
          className="px-2 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

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
              {contract.report_info.daily_data.map((d: any) => {
                const dateKey = d.date.split("T")[0];
                return (
                  <tr key={d.date} className="border-t border-gray-700">
                    <td className="p-2">{dateKey}</td>
                    <td className="p-2">{d.reported_value}</td>
                    <td className="p-2">{d.calculated_payout}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
