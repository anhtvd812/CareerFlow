import React from 'react';
import { Award } from 'lucide-react';

export default function CertificateCard({ certificate }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
        <Award className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-950">{certificate.name}</p>
        <p className="mt-1 text-sm text-slate-500">
          {certificate.issuer} • {certificate.issuedAt}
        </p>
      </div>
    </div>
  );
}
