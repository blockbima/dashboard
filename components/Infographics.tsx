"use client";

interface Contract {
  beneficiaries: string[];
  total_premium: number;
  total_claim_amount: number;
}

export default function Infographics({ contracts }: { contracts: Contract[] }) {
  const totalBeneficiaries = contracts.reduce((sum, c) => sum + c.beneficiaries.length, 0);
  const totalPremium = contracts.reduce((sum, c) => sum + c.total_premium, 0);
  const totalPayout = contracts.reduce((sum, c) => sum + c.total_claim_amount, 0);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded shadow">
        <h4 className="text-lg">Total Beneficiaries</h4>
        <p className="text-2xl font-bold">{totalBeneficiaries}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow">
        <h4 className="text-lg">Total Premium</h4>
        <p className="text-2xl font-bold">{totalPremium}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded shadow">
        <h4 className="text-lg">Total Payout</h4>
        <p className="text-2xl font-bold">{totalPayout}</p>
      </div>
    </div>
  );
}
