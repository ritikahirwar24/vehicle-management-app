import { useState } from "react";
import { User, getUsers, saveUsers, genId } from "@/lib/storage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-() ]{7,20}$/;

const UserManager = () => {
  const [users, setUsers] = useState<User[]>(getUsers);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const persist = (data: User[]) => {
    saveUsers(data);
    setUsers(data);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!phoneRegex.test(form.phone)) e.phone = "Invalid phone number";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editId) {
      persist(users.map((u) => (u.id === editId ? { ...u, ...form } : u)));
    } else {
      persist([...users, { id: genId(), ...form }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "" });
    setEditId(null);
    setErrors({});
    setShowForm(false);
  };

  const startEdit = (u: User) => {
    setForm({ name: u.name, phone: u.phone, email: u.email });
    setEditId(u.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this user?")) persist(users.filter((u) => u.id !== id));
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-card border border-border rounded-lg px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          + Add User
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">{editId ? "Edit User" : "Add New User"}</h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
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
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums">{u.phone}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => startEdit(u)} className="text-xs font-bold text-muted-foreground hover:text-foreground">EDIT</button>
                    <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-danger hover:opacity-80">DEL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            {users.length === 0 ? "No users yet. Click \"+ Add User\" to get started." : "No users match your search."}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
