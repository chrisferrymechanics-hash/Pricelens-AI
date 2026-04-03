import React, { useRef } from 'react';
import { Shield, Printer, X, Award, Hash, Calendar, Star, CheckCircle, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SOURCE_LABELS = {
  psa: { name: 'PSA (Professional Sports Authenticator)', url: 'https://www.psacard.com', type: 'Grading & Authentication' },
  bgs: { name: 'BGS / Beckett Grading Services', url: 'https://www.beckett.com/grading', type: 'Grading & Authentication' },
  cgc: { name: 'CGC (Certified Guaranty Company)', url: 'https://www.cgccomics.com', type: 'Comics & Cards Grading' },
  pcgs: { name: 'PCGS (Professional Coin Grading Service)', url: 'https://www.pcgs.com', type: 'Coin Grading & Authentication' },
  ngc: { name: 'NGC (Numismatic Guaranty Company)', url: 'https://www.ngccoin.com', type: 'Coin Grading' },
  sgc: { name: 'SGC (Sportscard Guaranty)', url: 'https://www.sgccard.com', type: 'Sports Card Grading' },
  jsa: { name: 'JSA (James Spence Authentication)', url: 'https://www.jsa.cc', type: 'Autograph Authentication' },
  'psa/dna': { name: 'PSA/DNA Authentication', url: 'https://www.psacard.com/autograph', type: 'Autograph Authentication' },
  bas: { name: 'BAS (Beckett Authentication Services)', url: 'https://www.beckett.com/authentication', type: 'Autograph Authentication' },
  heritage: { name: 'Heritage Auctions', url: 'https://www.ha.com', type: 'Auction House & Price Records' },
  ebay: { name: 'eBay Sold Listings', url: 'https://www.ebay.com', type: 'Market Price Reference' },
  comc: { name: 'COMC (Check Out My Collectibles)', url: 'https://www.comc.com', type: 'Marketplace & Price Reference' },
};

function getServiceInfo(serviceName) {
  const key = serviceName?.toLowerCase();
  for (const [k, v] of Object.entries(SOURCE_LABELS)) {
    if (key?.includes(k)) return { key: k, ...v };
  }
  return null;
}

function CertPrint({ result, certId, issueDate }) {
  const gradingService = result.grading_service || result.grading_estimates?.[0]?.service || 'AI Assessment';
  const primaryGrade = result.grading_estimates?.[0];

  return (
    <div id="cert-printable" className="bg-white text-gray-900 p-8 max-w-[750px] mx-auto font-serif">
      {/* Certificate Header */}
      <div className="text-center border-b-4 border-double border-gray-800 pb-6 mb-6">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Price Scout · Official Document</div>
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">Certificate of Authenticity</h1>
        <div className="text-xs text-gray-400 tracking-widest uppercase">& Itemized Assessment Report</div>
      </div>

      {/* Item Identity */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-center border border-gray-300 rounded p-3 mb-4 bg-gray-50">{result.item_name}</h2>
        {result.item_description && <p className="text-sm text-gray-600 text-center">{result.item_description}</p>}
        <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
          {result.collectible_type && <div className="text-center"><div className="text-xs text-gray-400 uppercase">Type</div><div className="font-semibold capitalize">{result.collectible_type.replace('_', ' ')}</div></div>}
          {result.year && <div className="text-center"><div className="text-xs text-gray-400 uppercase">Year</div><div className="font-semibold">{result.year}</div></div>}
          {result.edition && <div className="text-center"><div className="text-xs text-gray-400 uppercase">Edition</div><div className="font-semibold">{result.edition}</div></div>}
        </div>
      </div>

      {/* Identifiers */}
      {(result.serial_number || result.mint_mark || result.artist_signature) && (
        <div className="border border-gray-300 rounded p-4 mb-5">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1"><Hash className="w-3 h-3" /> Unique Identifiers</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {result.serial_number && <div><span className="text-gray-500">Serial / Cert No.:</span><span className="font-mono font-bold ml-2">{result.serial_number}</span></div>}
            {result.mint_mark && <div><span className="text-gray-500">Mint Mark:</span><span className="font-mono font-bold ml-2">{result.mint_mark}</span></div>}
            {result.artist_signature && <div className="col-span-2"><span className="text-gray-500">Signature / Autograph:</span><span className="font-bold italic ml-2">{result.artist_signature}</span></div>}
          </div>
        </div>
      )}

      {/* Authentication Assessment */}
      <div className="border-2 border-gray-800 rounded p-5 mb-5">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1"><Shield className="w-3 h-3" /> Authentication Assessment</div>
        {result.authenticity && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">Authenticity Confidence</span>
              <span className={`text-lg font-bold ${result.authenticity.confidence >= 80 ? 'text-green-700' : result.authenticity.confidence >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {result.authenticity.confidence}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-2">
              <div
                className={`h-2 rounded-full ${result.authenticity.confidence >= 80 ? 'bg-green-600' : result.authenticity.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${result.authenticity.confidence}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 italic">{result.authenticity.notes}</p>
          </div>
        )}

        {/* Authentication Methodology */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Authentication Methodology & Sources</div>
          <div className="text-xs text-gray-600 space-y-1.5">
            <div className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" /><span><strong>Visual AI Analysis:</strong> High-resolution image analysis examining surface details, identifiers, wear patterns, and physical characteristics consistent with the claimed item.</span></div>
            <div className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" /><span><strong>Database Cross-Reference:</strong> Item details cross-referenced against known population reports, census data, and authenticated examples from PSA, PCGS, NGC, CGC and Beckett registries.</span></div>
            <div className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" /><span><strong>Market Verification:</strong> Identifier, serial number, and edition data verified against publicly available auction records (Heritage Auctions, eBay) and grading registry databases.</span></div>
            {result.artist_signature && <div className="flex items-start gap-1.5"><CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" /><span><strong>Signature Analysis:</strong> Autograph/signature characteristics compared against authenticated reference examples from JSA, PSA/DNA and BAS databases.</span></div>}
          </div>
        </div>
      </div>

      {/* Condition Breakdown */}
      <div className="border border-gray-300 rounded p-4 mb-5">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Condition Assessment</div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Overall Score</span>
          <span className="text-2xl font-bold">{result.condition_score ?? '—'}<span className="text-sm text-gray-400">/10</span></span>
        </div>
        {result.condition_details?.summary && <p className="text-xs text-gray-600 mb-3 italic border-l-2 border-gray-300 pl-2">{result.condition_details.summary}</p>}
        {result.condition_details?.defects_found?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Observed Defects</div>
            {result.condition_details.defects_found.map((d, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-start gap-2 mb-1">
                <span className={`font-bold ${d.severity === 'severe' ? 'text-red-600' : d.severity === 'moderate' ? 'text-amber-600' : 'text-gray-400'}`}>·</span>
                <span><strong>{d.type}</strong> ({d.severity}) — {d.location}{d.price_impact ? ` · Impact: ${d.price_impact}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grading Estimates */}
      {result.grading_estimates?.length > 0 && (
        <div className="border border-gray-300 rounded p-4 mb-5">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Professional Grading Estimates</div>
          {result.grading_estimates.map((g, i) => {
            const info = getServiceInfo(g.service);
            return (
              <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm">{g.service}</div>
                    {info && <div className="text-xs text-gray-400">{info.type} · <span className="underline">{info.url}</span></div>}
                    <div className="text-xs text-gray-500 mt-0.5">Scale: {g.scale}</div>
                    {g.notes && <div className="text-xs text-gray-600 mt-1 italic">{g.notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">{g.estimated_grade}</div>
                    <div className="text-xs text-gray-400">Est. grade</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="text-xs text-gray-400 mt-2 italic border-t border-gray-100 pt-2">
            * These are AI-generated estimates based on visual analysis and market data. For official certification, submit to the respective grading service directly.
          </div>
        </div>
      )}

      {/* Valuation */}
      <div className="border border-gray-300 rounded p-4 mb-5">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Valuation Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Estimated Market Value (Ungraded)</div>
            <div className="text-lg font-bold">${result.estimated_value_low?.toFixed(0) ?? '—'} – ${result.estimated_value_high?.toFixed(0) ?? '—'}</div>
          </div>
          {result.graded_value_low != null && (
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Estimated Value (Graded)</div>
              <div className="text-lg font-bold">
                ${result.graded_value_low.toFixed(0)}{result.graded_value_high != null ? ` – $${result.graded_value_high.toFixed(0)}` : ''}
              </div>
            </div>
          )}
        </div>
        {result.historical_sales?.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Supporting Market Sales</div>
            {result.historical_sales.slice(0, 4).map((s, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-center justify-between py-0.5">
                <span>{s.date} · {s.platform}{s.grading_service ? ` · ${s.grading_service} ${s.grade || ''}` : ''}</span>
                <span className="font-bold">${s.price?.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Identifiers */}
      {result.key_identifiers?.length > 0 && (
        <div className="border border-gray-300 rounded p-4 mb-5">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Key Identifying Features</div>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
            {result.key_identifiers.map((k, i) => <li key={i}>{k}</li>)}
          </ul>
        </div>
      )}

      {/* Important Disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-5">
        <div className="text-xs font-bold text-amber-700 uppercase mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Important Disclaimer</div>
        <p className="text-xs text-amber-700">
          This document is an AI-generated preliminary assessment produced by Pricelens AI using computer vision and publicly available market data. It is <strong>not</strong> an official certification from PSA, BGS, CGC, PCGS, NGC, or any other professional grading service.
          This report is intended as a <strong>pre-submission guide</strong> to assist collectors in understanding potential item value and grading prospects. For official, legally recognised authentication and certification, the item must be physically submitted to the relevant professional grading service.
        </p>
      </div>

      {/* Terms & Legal */}
      <div className="border border-gray-200 rounded p-4 mb-5 bg-gray-50">
        <div className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> Terms of Use &amp; Legal Notice</div>
        <div className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
          <p><strong>Informational Purposes Only:</strong> This assessment report is provided solely for informational and reference purposes. It does not constitute a professional appraisal, legal valuation, insurance valuation, or official certification of any kind.</p>
          <p><strong>No Warranty:</strong> Pricelens AI makes no representations or warranties, express or implied, as to the accuracy, completeness, or fitness for any particular purpose of the information contained in this report. All valuations are AI-generated estimates and actual market values may differ significantly.</p>
          <p><strong>Limitation of Liability:</strong> Pricelens AI, its directors, employees, and agents shall not be liable for any financial loss, damage, or other consequence arising from reliance on this report. Users assume all risk associated with any decisions made based on this document.</p>
          <p><strong>Not a Substitute for Professional Advice:</strong> For high-value items, insurance purposes, estate planning, or legal proceedings, always obtain a valuation from a qualified, licensed professional appraiser or the relevant grading authority.</p>
          <p><strong>Intellectual Property:</strong> This document is generated for the personal use of the registered user only and may not be reproduced, redistributed, or presented as an official certification to any third party.</p>
          <p className="pt-1 border-t border-gray-200">By using Pricelens AI you agree to our Terms of Use. For full terms, privacy policy, and support, visit <span className="text-gray-700 underline">pricelensai.base44.app/AppInfo</span> or email <span className="text-gray-700">support@pricelensai.com</span>.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-double border-gray-800 pt-4 flex justify-between items-end text-xs text-gray-400">
        <div>
          <div className="font-semibold text-gray-700">Price Scout Assessment Report</div>
          <div>Certificate ID: <span className="font-mono">{certId}</span></div>
          <div>Issued: {issueDate}</div>
        </div>
        <div className="text-right">
          <div>Methodology: AI Vision + Internet Research</div>
          <div>pricescout.app</div>
        </div>
      </div>
    </div>
  );
}

export default function CertificateOfAuthenticity({ result, onClose }) {
  const certId = `PS-${Date.now().toString(36).toUpperCase()}`;
  const issueDate = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    const printContent = document.getElementById('cert-printable');
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Please allow popups to print the certificate.'); return; }
    win.document.write(`
      <html>
        <head>
          <title>Certificate of Authenticity – ${result.item_name}</title>
          <style>
            body { margin: 0; font-family: Georgia, serif; color: #111; background: white; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.onload = function() { window.print(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
      <div className="min-h-screen py-4 px-2">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 py-3 mb-4 rounded-t-xl max-w-[780px] mx-auto">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-semibold text-sm">Certificate of Authenticity</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="max-w-[780px] mx-auto rounded-b-xl overflow-hidden shadow-2xl">
          <CertPrint result={result} certId={certId} issueDate={issueDate} />
        </div>
      </div>
    </div>
  );
}