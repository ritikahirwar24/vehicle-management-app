import { useState } from "react";
import { Policy, getPolicies, savePolicies, getPolicyStatus, genId } from "@/lib/storage";

const PolicyManager = () => {
  const [policies, setPolicies] = useState<Policy[]>(getPolicies);
  const [form, setForm] = useState({
    policyNumber: "", vehicleNumber: "", provider: "",
    startDate: "", expiryDate: "", premiumAmount: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Expired">("all");

  const persist = (data: Policy[]) => {
    savePolicies(data);
    setPolicies(data);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.policyNumber.trim()) e.policyNumber = "Policy number is required";
    else if (!editId && policies.some((p) => p.policyNumber === form.policyNumber.trim()))
      e.policyNumber = "Duplicate policy number";
    else if (editId) {
      const existing = policies.find((p) => p.policyNumber === form.policyNumber.trim() && p.id !== editId);
      if (existing) e.policyNumber = "Duplicate policy number";
    }
    if (!form.vehicleNumber.trim()) e.vehicleNumber = "Vehicle number is required";
    if (!form.provider.trim()) e.provider = "Provider is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.expiryDate) e.expiryDate = "Expiry date is required";
    if (!form.premiumAmount) e.premiumAmount = "Premium amount is required";
    else if (isNaN(Number(form.premiumAmount)) || Number(form.premiumAmount) <= 0)
      e.premiumAmount = "Must be a positive number";
    if (form.startDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.startDate))
      e.expiryDate = "Expiry must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const data: Policy = {
      id: editId || genId(),
      policyNumber: form.policyNumber.trim(),
      vehicleNumber: form.vehicleNumber.trim(),
      provider: form.provider.trim(),
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      premiumAmount: Number(form.premiumAmount),
      renewed: false,
    };

    if (editId) {
      persist(policies.map((p) => (p.id === editId ? data : p)));
    } else {
      persist([...policies, data]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ policyNumber: "", vehicleNumber: "", provider: "", startDate: "", expiryDate: "", premiumAmount: "" });
    setEditId(null);
    setErrors({});
    setShowForm(false);
  };

  const startEdit = (p: Policy) => {
    setForm({
      policyNumber: p.policyNumber,
      vehicleNumber: p.vehicleNumber,
      provider: p.provider,
      startDate: p.startDate,
      expiryDate: p.expiryDate,
      premiumAmount: String(p.premiumAmount),
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this policy?")) persist(policies.filter((p) => p.id !== id));
  };

  const handleRenew = (id: string) => {
    persist(
      policies.map((p) => {
        if (p.id !== id) return p;
        const newExpiry = new Date(p.expiryDate);
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        return { ...p, expiryDate: newExpiry.toISOString().split("T")[0], renewed: true };
      })
    );
  };

  const filtered = policies.filter((p) => {
    const matchSearch =
      p.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.vehicleNumber.toLowerCase().includes(search.toLowerCase());
    const status = getPolicyStatus(p);
    const matchStatus = statusFilter === "all" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fields: { key: keyof typeof form; label: string; type?: string }[] = [
    { key: "policyNumber", label: "Policy Number" },
    { key: "vehicleNumber", label: "Vehicle Number" },
    { key: "provider", label: "Provider" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "premiumAmount", label: "Premium ($)", type: "number" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search by policy # or vehicle #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-card border border-border rounded-lg px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "Active" | "Expired")}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            + New Policy
          </button>
        </div>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">{editId ? "Edit Policy" : "Add New Policy"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors[f.key] && <p className="text-danger text-xs mt-1">{errors[f.key]}</p>}
              </div>
            ))}
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save Policy</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Policy / Vehicle</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Premium</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const status = getPolicyStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm tabular-nums">{p.policyNumber}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-tight">{p.vehicleNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.provider}</td>
                    <td className="px-6 py-4 text-sm tabular-nums text-muted-foreground">{p.expiryDate}</td>
                    <td className="px-6 py-4 text-sm tabular-nums">${p.premiumAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          status === "Active"
                            ? "text-success bg-success/10"
                            : "text-danger bg-danger/10"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleRenew(p.id)} className="text-xs font-bold text-accent hover:opacity-80">RENEW</button>
                      <button onClick={() => startEdit(p)} className="text-xs font-bold text-muted-foreground hover:text-foreground">EDIT</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs font-bold text-danger hover:opacity-80">DEL</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {policies.length === 0 ? "No policies yet. Click \"+ New Policy\" to get started." : "No policies match your criteria."}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyManager;
