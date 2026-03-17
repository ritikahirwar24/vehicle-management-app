import { Policy, getExpiringPolicies } from "@/lib/storage";

interface AlertBannerProps {
  policies: Policy[];
}

const AlertBanner = ({ policies }: AlertBannerProps) => {
  const expiring = getExpiringPolicies(policies);
  if (expiring.length === 0) return null;

  return (
    <div className="bg-warning text-warning-foreground px-6 py-3 text-center text-sm font-medium">
      ⚠️ <strong>Alert:</strong> {expiring.length} policy(ies) expiring within 7 days.
    </div>
  );
};

export default AlertBanner;
