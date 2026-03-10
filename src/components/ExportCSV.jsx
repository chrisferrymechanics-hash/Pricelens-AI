import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

function toCSVRow(values) {
  return values.map(v => {
    const str = v == null ? '' : String(v);
    return `"${str.replace(/"/g, '""')}"`;
  }).join(',');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getValueRange(item) {
  const low = item.estimated_value_low || item.last_known_value_low || item.secondhand_price_low || item.new_price_low;
  const high = item.estimated_value_high || item.last_known_value_high || item.secondhand_price_high || item.new_price_high;
  if (!low && !high) return '';
  if (low && high) return `$${Number(low).toFixed(2)} – $${Number(high).toFixed(2)}`;
  return `$${Number(low || high).toFixed(2)}`;
}

// Build rows from history (PriceEvaluation) or watchlist (WatchlistItem) items
function buildRows(items, source) {
  const headers = ['Item Name', 'Category', 'Type', 'Estimated Value Low (USD)', 'Estimated Value High (USD)', 'Value Range', 'Condition', 'Date of Evaluation', 'Last Checked'];
  const rows = items.map(item => [
    item.item_name || '',
    item.category || '',
    item.collectible_type || '',
    source === 'history'
      ? (item.estimated_value_low || item.secondhand_price_low || item.new_price_low || '')
      : (item.last_known_value_low || ''),
    source === 'history'
      ? (item.estimated_value_high || item.secondhand_price_high || item.new_price_high || '')
      : (item.last_known_value_high || ''),
    getValueRange(item),
    item.condition_estimate || '',
    formatDate(item.created_date),
    formatDate(item.last_checked || item.updated_date),
  ]);
  return { headers, rows };
}

export default function ExportCSV({ items, source = 'history', label }) {
  const handleExport = () => {
    const { headers, rows } = buildRows(items, source);
    const csv = [toCSVRow(headers), ...rows.map(toCSVRow)].join('\n');
    const filename = source === 'history' ? 'search_history.csv' : 'watchlist.csv';
    downloadFile('\uFEFF' + csv, filename, 'text/csv;charset=utf-8;');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
    >
      <Download className="w-4 h-4" />
      {label || 'Export CSV'}
    </Button>
  );
}