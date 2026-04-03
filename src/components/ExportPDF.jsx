import React, { useState } from 'react';
import { FileDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

function formatCurrency(val) {
  if (!val && val !== 0) return null;
  return '$' + Number(val).toFixed(0);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

async function loadImageAsBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function ExportPDF({ item }) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = 210;
    const margin = 16;
    const contentW = W - margin * 2;
    let y = 0;

    // ── Header bar ──────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, W, 28, 'F');

    doc.setTextColor(34, 211, 238); // cyan-400
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Price Scout', margin, 12);

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Price Evaluation Report', margin, 18);
    doc.text(`Generated: ${formatDate(new Date())}`, margin, 23);

    y = 36;

    // ── Item name ────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(item.item_name || 'Unknown Item', contentW - 50);
    doc.text(nameLines, margin, y);
    y += nameLines.length * 6 + 2;

    if (item.item_description) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105); // slate-600
      const descLines = doc.splitTextToSize(item.item_description, contentW - 50);
      doc.text(descLines, margin, y);
      y += descLines.length * 4.5 + 2;
    }

    // ── Image (right side) ───────────────────────────────
    const imgUrl = item.front_image_url || item.image_url;
    if (imgUrl) {
      const b64 = await loadImageAsBase64(imgUrl);
      if (b64) {
        const imgX = W - margin - 44;
        const imgY = 32;
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(imgX - 1, imgY - 1, 46, 46, 3, 3, 'F');
        doc.addImage(b64, 'JPEG', imgX, imgY, 44, 44);
      }
    }

    y = Math.max(y, 82);

    // ── Divider ──────────────────────────────────────────
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, W - margin, y);
    y += 8;

    // ── Value Section ────────────────────────────────────
    const priceLow = item.estimated_value_low || item.secondhand_price_low || item.new_price_low;
    const priceHigh = item.estimated_value_high || item.secondhand_price_high || item.new_price_high;

    if (priceLow || priceHigh) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.roundedRect(margin, y, contentW, 20, 3, 3, 'FD');

      doc.setTextColor(6, 95, 70); // emerald-900
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Value Range', margin + 4, y + 7);

      doc.setFontSize(16);
      doc.setTextColor(5, 150, 105); // emerald-600
      const rangeText = priceLow && priceHigh
        ? `${formatCurrency(priceLow)} – ${formatCurrency(priceHigh)}`
        : formatCurrency(priceLow || priceHigh);
      doc.text(rangeText, margin + 4, y + 16);

      y += 28;
    }

    // ── Price breakdown boxes ────────────────────────────
    const priceBoxes = [
      { label: 'New', low: item.new_price_low, high: item.new_price_high },
      { label: 'Used', low: item.secondhand_price_low, high: item.secondhand_price_high },
      { label: 'Auction', low: item.auction_price_low, high: item.auction_price_high },
    ].filter(b => b.low || b.high);

    if (priceBoxes.length > 0) {
      const boxW = (contentW - (priceBoxes.length - 1) * 4) / priceBoxes.length;
      priceBoxes.forEach((box, i) => {
        const bx = margin + i * (boxW + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, y, boxW, 18, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(box.label, bx + 4, y + 6);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const txt = box.low && box.high
          ? `${formatCurrency(box.low)}–${formatCurrency(box.high)}`
          : formatCurrency(box.low || box.high);
        doc.text(txt, bx + 4, y + 14);
      });
      y += 26;
    }

    // ── Condition ────────────────────────────────────────
    if (item.condition_estimate || item.condition_score || item.condition_details?.summary) {
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, W - margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Condition Assessment', margin, y);
      y += 6;

      const conditionRow = [];
      if (item.condition_estimate) conditionRow.push(`Condition: ${item.condition_estimate.replace('_', ' ')}`);
      if (item.condition_score) conditionRow.push(`Score: ${item.condition_score}/10`);
      if (conditionRow.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(conditionRow.join('   •   '), margin, y);
        y += 5;
      }

      if (item.condition_details?.summary) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const lines = doc.splitTextToSize(item.condition_details.summary, contentW);
        doc.text(lines, margin, y);
        y += lines.length * 4.5 + 3;
      }

      // Defects
      if (item.condition_details?.defects_found?.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Defects found:', margin, y);
        y += 5;
        item.condition_details.defects_found.slice(0, 5).forEach(d => {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const txt = `• ${d.type} (${d.severity}) — ${d.location || ''}`;
          const lines = doc.splitTextToSize(txt, contentW - 4);
          doc.text(lines, margin + 2, y);
          y += lines.length * 4.5;
        });
        y += 2;
      }
    }

    // ── Category / Type ──────────────────────────────────
    const tags = [];
    if (item.category) tags.push({ label: item.category, color: [100, 116, 139] });
    if (item.collectible_type) tags.push({ label: item.collectible_type, color: [217, 119, 6] });
    if (item.rarity) tags.push({ label: item.rarity.replace('_', ' '), color: [124, 58, 237] });
    if (item.year) tags.push({ label: `Year: ${item.year}`, color: [37, 99, 235] });

    if (tags.length > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, W - margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Details', margin, y);
      y += 6;

      let tx = margin;
      tags.forEach(tag => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const tw = doc.getTextWidth(tag.label) + 6;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...tag.color);
        doc.roundedRect(tx, y - 4, tw, 7, 1.5, 1.5, 'FD');
        doc.setTextColor(...tag.color);
        doc.text(tag.label, tx + 3, y + 1);
        tx += tw + 3;
      });
      y += 10;
    }

    // ── Sell Recommendations ─────────────────────────────
    const sellRecs = item.sell_recommendations?.slice(0, 4) || [];
    if (sellRecs.length > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, W - margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Where to Sell', margin, y);
      y += 6;

      sellRecs.forEach(rec => {
        if (y > 265) return;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'FD');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(rec.platform || '', margin + 4, y + 6);

        if (rec.expected_price) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(5, 150, 105);
          doc.text(rec.expected_price, margin + 4, y + 11);
        }

        if (rec.fees) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          const feeTxt = `Fees: ${rec.fees}`;
          const fw = doc.getTextWidth(feeTxt);
          doc.text(feeTxt, W - margin - fw - 4, y + 6);
        }

        if (rec.time_to_sell) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          const tts = `~${rec.time_to_sell}`;
          const tw = doc.getTextWidth(tts);
          doc.text(tts, W - margin - tw - 4, y + 11);
        }

        y += 17;
      });
    }

    // ── Professional Endorsement ──────────────────────────
    if (y > 210) { doc.addPage(); y = 16; }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, W - margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Professional Endorsement & Independent Verification', margin, y);
    y += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('This section is for endorsement by a qualified appraiser or recognised industry expert confirming agreement with or amendments to the above AI-generated assessment.', margin, y, { maxWidth: contentW });
    y += 9;

    // Draw dashed border box
    doc.setDrawColor(180, 180, 180);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(margin, y, contentW, 62, 'D');
    doc.setLineDashPattern([], 0);

    // Left column - Signature & Name
    const col1X = margin + 4;
    const col2X = margin + contentW / 2 + 4;
    const colW = contentW / 2 - 8;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('QUALIFIED PROFESSIONAL SIGNATURE', col1X, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 160);
    // Signature line
    doc.setDrawColor(100, 116, 139);
    doc.line(col1X, y + 20, col1X + colW, y + 20);
    doc.setFontSize(6.5);
    doc.text('Signature', col1X, y + 24);

    // Name line
    doc.setDrawColor(200, 200, 200);
    doc.line(col1X, y + 34, col1X + colW, y + 34);
    doc.text('Printed Name & Qualifications', col1X, y + 38);

    // Date line
    doc.line(col1X, y + 48, col1X + colW, y + 48);
    doc.text('Date of Inspection', col1X, y + 52);

    // Licence line
    doc.line(col1X, y + 58, col1X + colW, y + 58);
    doc.text('Licence / Membership No.', col1X, y + 62);

    // Right column - Stamp
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('OFFICIAL STAMP / SEAL', col2X, y + 7);

    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.rect(col2X, y + 10, colW, 38, 'D');
    doc.setLineDashPattern([], 0);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Affix Professional', col2X + colW / 2, y + 26, { align: 'center' });
    doc.text('Stamp or Seal Here', col2X + colW / 2, y + 31, { align: 'center' });

    // Notes line at bottom of right column
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([], 0);
    doc.line(col2X, y + 58, col2X + colW, y + 58);
    doc.setFontSize(6.5);
    doc.setTextColor(160, 160, 160);
    doc.text('Professional Assessment Notes', col2X, y + 62);

    y += 70;

    // ── Terms & Legal ─────────────────────────────────────
    if (y > 230) { doc.addPage(); y = 16; }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, W - margin, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Terms of Use & Legal Notice', margin, y);
    y += 5;

    const legalText = [
      'INFORMATIONAL PURPOSES ONLY: This report is provided solely for informational and reference purposes. It does not constitute a professional appraisal, legal valuation, insurance valuation, or official certification of any kind.',
      'NO WARRANTY: Pricelens AI makes no representations or warranties as to the accuracy, completeness, or fitness for any particular purpose of the information in this report. All valuations are AI-generated estimates and actual market values may differ significantly.',
      'LIMITATION OF LIABILITY: Pricelens AI, its directors, employees, and agents shall not be liable for any financial loss, damage, or other consequence arising from reliance on this report. Users assume all risk associated with decisions made based on this document.',
      'NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE: For high-value items, insurance, estate planning, or legal proceedings, always obtain a valuation from a qualified, licensed professional appraiser.',
      'By using Pricelens AI you agree to our Terms of Use. For full terms, privacy policy, and support visit pricelensai.base44.app/AppInfo or email support@pricelensai.com.',
    ];

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    legalText.forEach(line => {
      if (y > 276) { doc.addPage(); y = 16; }
      const wrapped = doc.splitTextToSize(line, contentW);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 3.8 + 2;
    });
    y += 3;

    // ── Footer ────────────────────────────────────────────
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Generated by Pricelens AI • AI-powered pricing may vary from actual market conditions', margin, 292);

    const safeName = (item.item_name || 'evaluation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`price-scout-${safeName}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={generate}
      disabled={loading}
      className="text-slate-500 hover:text-cyan-400 flex-shrink-0"
      title="Export PDF"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
    </Button>
  );
}