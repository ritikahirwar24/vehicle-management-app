import { useState } from "react";
import { Vehicle, getVehicles, saveVehicles, genId } from "@/lib/storage";

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(getVehicles);
  const [form, setForm] = useState({ ownerName: "", vehicleNumber: "", type: "", model: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const persist = (data: Vehicle[]) => {
    saveVehicles(data);
    setVehicles(data);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    if (!form.vehicleNumber.trim()) e.vehicleNumber = "Vehicle number is required";
    if (!form.type.trim()) e.type = "Vehicle type is required";
    if (!form.model.trim()) e.model = "Model is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (editId) {
      persist(vehicles.map((v) => (v.id === editId ? { ...v, ...form } : v)));
    } else {
      persist([...vehicles, { id: genId(), ...form }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ ownerName: "", vehicleNumber: "", type: "", model: "" });
    setEditId(null);
    setErrors({});
    setShowForm(false);
  };

  const startEdit = (v: Vehicle) => {
    setForm({ ownerName: v.ownerName, vehicleNumber: v.vehicleNumber, type: v.type, model: v.model });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this vehicle?")) persist(vehicles.filter((v) => v.id !== id));
  };

  const filtered = vehicles.filter(
    (v) =>
      v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search by vehicle # or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-card border border-border rounded-lg px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          + Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">{editId ? "Edit Vehicle" : "Add New Vehicle"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["ownerName", "vehicleNumber", "type", "model"] as const).map((field) => (
              <div key={field}>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {field === "ownerName" ? "Owner Name" : field === "vehicleNumber" ? "Vehicle Number" : field === "type" ? "Vehicle Type" : "Model"}
                </label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors[field] && <p className="text-danger text-xs mt-1">{errors[field]}</p>}
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehicle #</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold tabular-nums">{v.vehicleNumber}</td>
                  <td className="px-6 py-4 text-sm">{v.ownerName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{v.type}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{v.model}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => startEdit(v)} className="text-xs font-bold text-muted-foreground hover:text-foreground">EDIT</button>
                    <button onClick={() => handleDelete(v.id)} className="text-xs font-bold text-danger hover:opacity-80">DEL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {vehicles.length === 0 ? "No vehicles yet. Click \"+ Add Vehicle\" to get started." : "No vehicles match your search."}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManager;
