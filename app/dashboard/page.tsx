"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { CSVLink } from "react-csv";
import clsx from "clsx";
import Infographics from "../../components/Infographics";

// Dynamically load the map (no SSR)
const MapPreview = dynamic(() => import("../../components/MapPreview"), { ssr: false });

export default function Dashboard() {
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [sortKey, setSortKey] = useState<keyof any>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchContracts = () => {
    fetch("/api/contracts")
      .then((res) => res.json())
      .then((data) => {
        setAllContracts(data.contracts || []);
        setLastFetched(new Date());
      })
      .catch(() => setAllContracts([]));
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const cutoffDate = new Date("2025-06-24");
  const filtered = allContracts.filter((c) => {
    const created = new Date(c.created_at);
    const afterCutoff = created >= cutoffDate;
    const byRegion = !regionFilter || c.region.name === regionFilter;
    const bySearch =
      !searchTerm ||
      c.id.includes(searchTerm) ||
      c.beneficiaries.some((b: string) => b.includes(searchTerm));
    return afterCutoff && byRegion && bySearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey], bVal = b[sortKey];
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const regions = Array.from(new Set(allContracts.map((c) => c.region.name)));

  return (
    <div className="bg-gray-900 text-gray-100 space-y-6 min-h-screen p-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          placeholder="Search by ID or beneficiary"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPageNum(1);
          }}
          className="bg-gray-800 text-gray-100 border border-gray-700 placeholder-gray-500 px-2 py-1 rounded"
        />
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setPageNum(1);
          }}
          className="bg-gray-800 text-gray-100 border border-gray-700 px-2 py-1 rounded"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <CSVLink
          data={sorted}
          filename="contracts.csv"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
        >
          Export CSV
        </CSVLink>
        <button
          onClick={fetchContracts}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
        >
          Reload
        </button>
        {lastFetched && (
          <span className="text-sm text-gray-400 ml-2">
            Last updated: {lastFetched.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-700 rounded">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800">
              {[ 
                { key: "region", label: "Region" },
                { key: "beneficiaries", label: "Beneficiaries" },
                { key: "total_premium", label: "Premium" },
                { key: "settlement_amount", label: "Payout" },
                { key: "is_fulfilled", label: "Status" },
                { key: "created_at", label: "Created At" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="p-2 text-left text-gray-100 cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  {label}
                  {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`/contracts/${c.id}`)}
                className={clsx(
                  "border-t border-gray-700 hover:bg-gray-800",
                  !c.is_fulfilled && "bg-gray-800"
                )}
              >
                <td className="p-2">{c.region.name}</td>
                <td className="p-2">{c.beneficiaries.length}</td>
                <td className="p-2">{c.total_premium}</td>
                <td className="p-2">{c.total_claim_amount}</td>
                <td className="p-2">{c.is_fulfilled ? "Settled" : "Active"}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
        <button
          disabled={pageNum === 1}
          onClick={() => setPageNum((p) => p - 1)}
          className="px-3 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {pageNum} of {totalPages}
        </span>
        <button
          disabled={pageNum === totalPages}
          onClick={() => setPageNum((p) => p + 1)}
          className="px-3 py-1 bg-gray-700 text-gray-100 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Map & Infographics */}
      <div className="grid grid-cols-2 gap-6">
        <MapPreview contracts={filtered} />
        <Infographics contracts={filtered} />
      </div>
    </div>
  );
}
