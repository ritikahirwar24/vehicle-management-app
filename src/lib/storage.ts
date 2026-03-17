// localStorage helpers for InsurTrack data persistence

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Vehicle {
  id: string;
  ownerName: string;
  vehicleNumber: string;
  type: string;
  model: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  vehicleNumber: string;
  provider: string;
  startDate: string;
  expiryDate: string;
  premiumAmount: number;
  renewed: boolean;
}

// Compute status dynamically based on expiry date
export function getPolicyStatus(policy: Policy): "Active" | "Expired" {
  return new Date(policy.expiryDate) >= new Date() ? "Active" : "Expired";
}

// Count policies expiring within N days
export function getExpiringPolicies(policies: Policy[], days = 7): Policy[] {
  const today = new Date();
  return policies.filter((p) => {
    const exp = new Date(p.expiryDate);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= days;
  });
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const KEYS = { users: "insur_users", vehicles: "insur_vehicles", policies: "insur_policies" };

// Default seed data (only inserted once if localStorage is empty)
const defaultUsers: User[] = [
  { id: "user1", name: "Rahul Sharma", phone: "9876543210", email: "rahul.sharma@example.com" },
  { id: "user2", name: "Priya Verma", phone: "9876543211", email: "priya.verma@example.com" },
  { id: "user3", name: "Amit Patel", phone: "9876543212", email: "amit.patel@example.com" },
];

const defaultVehicles: Vehicle[] = [
  { id: "vehicle1", ownerName: "Rahul Sharma", vehicleNumber: "MH12AB1234", type: "Car", model: "Sedan" },
  { id: "vehicle2", ownerName: "Priya Verma", vehicleNumber: "DL05XY5678", type: "Bike", model: "Cruiser" },
];

// Helper to get a date string offset from today
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const defaultPolicies: Policy[] = [
  // Active — expires in ~9 months
  {
    id: "policy1", policyNumber: "POL-2025-001", vehicleNumber: "MH12AB1234",
    provider: "ICICI Lombard", startDate: dateOffset(-90), expiryDate: dateOffset(275),
    premiumAmount: 12000, renewed: false,
  },
  // Active — expires in ~6 months
  {
    id: "policy2", policyNumber: "POL-2025-002", vehicleNumber: "DL05XY5678",
    provider: "Bajaj Allianz", startDate: dateOffset(-180), expiryDate: dateOffset(185),
    premiumAmount: 5500, renewed: false,
  },
  // Active — expires in ~1 year
  {
    id: "policy3", policyNumber: "POL-2025-003", vehicleNumber: "MH12AB1234",
    provider: "HDFC Ergo", startDate: dateOffset(-60), expiryDate: dateOffset(305),
    premiumAmount: 15000, renewed: false,
  },
  // ⚠️ Expiring in 3 days — triggers alert banner
  {
    id: "policy4", policyNumber: "POL-2025-004", vehicleNumber: "DL05XY5678",
    provider: "New India Assurance", startDate: dateOffset(-362), expiryDate: dateOffset(3),
    premiumAmount: 7200, renewed: false,
  },
  // ⚠️ Expiring in 5 days — triggers alert banner
  {
    id: "policy5", policyNumber: "POL-2025-005", vehicleNumber: "MH12AB1234",
    provider: "Oriental Insurance", startDate: dateOffset(-360), expiryDate: dateOffset(5),
    premiumAmount: 8400, renewed: false,
  },
  // Expired — 30 days ago
  {
    id: "policy6", policyNumber: "POL-2024-006", vehicleNumber: "DL05XY5678",
    provider: "Tata AIG", startDate: dateOffset(-395), expiryDate: dateOffset(-30),
    premiumAmount: 9800, renewed: false,
  },
  // Expired — 90 days ago
  {
    id: "policy7", policyNumber: "POL-2024-007", vehicleNumber: "MH12AB1234",
    provider: "Reliance General", startDate: dateOffset(-455), expiryDate: dateOffset(-90),
    premiumAmount: 11200, renewed: false,
  },
];

// Initialize default data ONLY if localStorage keys don't exist yet
export function initializeDefaultData() {
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, defaultUsers);
  }
  if (!localStorage.getItem(KEYS.vehicles)) {
    write(KEYS.vehicles, defaultVehicles);
  }
  if (!localStorage.getItem(KEYS.policies)) {
    write(KEYS.policies, defaultPolicies);
  }
}

// Users
export const getUsers = () => read<User>(KEYS.users);
export const saveUsers = (data: User[]) => write(KEYS.users, data);

// Vehicles
export const getVehicles = () => read<Vehicle>(KEYS.vehicles);
export const saveVehicles = (data: Vehicle[]) => write(KEYS.vehicles, data);

// Policies
export const getPolicies = () => read<Policy>(KEYS.policies);
export const savePolicies = (data: Policy[]) => write(KEYS.policies, data);

// Generate simple unique ID
export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
