import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, BellOff, BellRing, Tag, DollarSign, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AddSubscriptionForm({ onAdd, onCancel, userEmail }) {
  const [keyword, setKeyword] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setSaving(true);
    await onAdd({ keyword: keyword.trim(), max_price: maxPrice ? parseFloat(maxPrice) : null, user_email: userEmail, is_active: true });
    setSaving(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3"
    >
      <h3 className="text-sm font-semibold text-white">New Keyword Alert</h3>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Item keyword *</label>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
          <Tag className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="e.g. Nike Air Jordan 1, vintage Rolex..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder-slate-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 mb-1 block">Max price (optional — alert only if below this)</label>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
          <DollarSign className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            type="number"
            placeholder="e.g. 150"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder-slate-500"
            min="0"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="flex-1 text-slate-400">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={saving || !keyword.trim()}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4 mr-1" />Add Alert</>}
        </Button>
      </div>
    </motion.form>
  );
}

function SubscriptionCard({ sub, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(sub.id);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(sub.id, !sub.is_active);
    setToggling(false);
  };

  const lastChecked = sub.last_checked
    ? new Date(sub.last_checked).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Never';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-xl border transition-colors ${
        sub.is_active
          ? 'bg-slate-800/60 border-slate-700'
          : 'bg-slate-900/40 border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg ${sub.is_active ? 'bg-cyan-500/15' : 'bg-slate-800'}`}>
          {sub.is_active
            ? <BellRing className="w-4 h-4 text-cyan-400" />
            : <BellOff className="w-4 h-4 text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{sub.keyword}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {sub.max_price && (
              <span className="text-xs text-slate-400">Max ${sub.max_price}</span>
            )}
            <span className="text-xs text-slate-500">Last checked: {lastChecked}</span>
            {sub.alert_count > 0 && (
              <span className="text-xs text-emerald-400">{sub.alert_count} alert{sub.alert_count > 1 ? 's' : ''} sent</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title={sub.is_active ? 'Pause' : 'Resume'}
          >
            {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : sub.is_active ? <BellOff className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function SubscriptionsManager() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.Subscription.list('-created_date');
      setSubs(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async (data) => {
    const created = await base44.entities.Subscription.create(data);
    setSubs(prev => [created, ...prev]);
    setShowForm(false);
  };

  const handleToggle = async (id, is_active) => {
    await base44.entities.Subscription.update(id, { is_active });
    setSubs(prev => prev.map(s => s.id === id ? { ...s, is_active } : s));
  };

  const handleDelete = async (id) => {
    await base44.entities.Subscription.delete(id);
    setSubs(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-white">Deal Alerts</h2>
          {subs.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">{subs.filter(s => s.is_active).length} active</span>
          )}
        </div>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white h-8 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Alert
          </Button>
        )}
      </div>

      {/* Email info */}
      {user && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Alerts sent to <span className="text-white">{user.email}</span></span>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <AddSubscriptionForm
            onAdd={handleAdd}
            onCancel={() => setShowForm(false)}
            userEmail={user?.email || ''}
          />
        )}
      </AnimatePresence>

      {/* Subscription list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      ) : subs.length === 0 && !showForm ? (
        <div className="text-center py-10">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No alerts yet</p>
          <p className="text-slate-600 text-xs mt-1">Add a keyword to get emailed when deals appear</p>
          <Button size="sm" onClick={() => setShowForm(true)} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white">
            <Plus className="w-4 h-4 mr-1" /> Create your first alert
          </Button>
        </div>
      ) : (
        <AnimatePresence>
          {subs.map(sub => (
            <SubscriptionCard
              key={sub.id}
              sub={sub}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}