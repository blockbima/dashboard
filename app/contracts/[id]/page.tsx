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

  const regionCoordinates: Record<string, { lat: number; lon: number }> = {
    Nyeri: { lat: -0.4371, lon: 36.9580 },
    Kitengela: { lat: -1.4787, lon: 36.9577 },
    Marikiti: { lat: -1.2752, lon: 36.8878 },
  };

  const [weatherData, setWeatherData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setContract(data))
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!contract?.region?.name || !Array.isArray(contract?.report_info?.daily_data)) return;

    const region = contract.region.name;
    const coords = regionCoordinates[region];
    if (!coords) return;

    const dates = contract.report_info.daily_data.map((d: any) => d.date);
    const start = dates[0];
    const end = dates[dates.length - 1];

    fetch(
      `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=${coords.lat}&longitude=${coords.lon}` +
        `&start_date=${start}&end_date=${end}` +
        `&daily=precipitation_sum` +
        `&timezone=Africa/Nairobi` +
        `&precipitation_unit=mm`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const result: Record<string, number> = {};
        if (data.daily?.time && Array.isArray(data.daily.time)) {
          data.daily.time.forEach((d: string, i: number) => {
            result[d] = data.daily.precipitation_sum[i];
          });
        }
        setWeatherData(result);
      })
      .catch((e) => {
        console.error("Weather fetch error:", e);
      });
  }, [contract]);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!contract) return <div className="p-6 text-gray-100">Loading...</div>;

  const rawEntries = Object.entries(contract);
  const totalFields = rawEntries.length;
  const [keyName, keyValue] = rawEntries[fieldIdx] || ["", ""];

  const totalBeneficiaryPages = Math.ceil(contract.beneficiaries.length / pageSize);
  const paginatedBeneficiaries = contract.beneficiaries.slice(
    (beneficiaryPage - 1) * pageSize,
    beneficiaryPage * pageSize
  );

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 text-indigo-400 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Contract {contract.id}</h2>
          <p><strong>Region:</strong> {contract.region.name}</p>
          <p><strong>Total Premium:</strong> {contract.total_premium}</p>
          <p><strong>Status:</strong> {contract.is_fulfilled ? "Settled" : "Active"}</p>
          <p><strong>Settlement Tx:</strong> {contract.settlement_transaction_id ? (
            <a href={`https://explorer.testnet.xrplevm.org/tx/${contract.settlement_transaction_id}`}
               target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
              {contract.settlement_transaction_id}
            </a>) : "N/A"}</p>
          <p><strong>Maturity Date:</strong> {new Date(contract.maturity_date).toLocaleDateString()}</p>
          <p><strong>Smart Contract:</strong> {contract.smart_contract_address ? (
            <a href={`https://explorer.testnet.xrplevm.org/address/${contract.smart_contract_address}`}
               target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
              {contract.smart_contract_address}
            </a>) : "N/A"}</p>
          <p><strong>Created At:</strong> {new Date(contract.created_at).toLocaleDateString()}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded p-4">
            <div className="text-3xl font-bold">{contract.beneficiaries.length}</div>
            <div className="text-gray-400">Number of Beneficiaries</div>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-3xl font-bold">{contract.total_claim_amount}</div>
            <div className="text-gray-400">Total Payout</div>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-3xl font-bold">
              {contract.beneficiaries.length > 0
                ? (contract.total_claim_amount / contract.beneficiaries.length).toFixed(2)
                : "N/A"}
            </div>
            <div className="text-gray-400">Individual Claim Amount</div>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl font-semibold">Beneficiaries</h3>
      <table className="min-w-full border mt-2">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Copy</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBeneficiaries.map((b: string, i: number) => (
            <tr key={i} className="border-t border-gray-700">
              <td className="p-2">{(beneficiaryPage - 1) * pageSize + i + 1}</td>
              <td className="p-2 truncate max-w-xs" title={b}>{b}</td>
              <td className="p-2">
                <button
                  onClick={() => navigator.clipboard.writeText(b)}
                  className="text-indigo-400 underline"
                >
                  Copy
                </button>
              </td>
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
                <th className="p-2 text-left">Rain (mm)</th>
              </tr>
            </thead>
            <tbody>
              {contract.report_info.daily_data.map((d: any) => (
                <tr key={d.date} className="border-t border-gray-700">
                  <td className="p-2">{d.date}</td>
                  <td className="p-2">{d.reported_value}</td>
                  <td className="p-2">{d.calculated_payout}</td>
                  <td className="p-2">{weatherData[d.date] ?? "..."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

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
                  <td className="p-2 font-mono">
                    {keyName === "settlement_transaction_id" && keyValue ? (
                      <a href={`https://explorer.testnet.xrplevm.org/tx/${String(keyValue)}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">
                        {String(keyValue)}
                      </a>
                    ) : (
                      JSON.stringify(keyValue)
                    )}
                  </td>
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
