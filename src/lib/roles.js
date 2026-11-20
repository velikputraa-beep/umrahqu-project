export const ROLES = [
  { value: "admin", label: "Admin", tone: "blue" },
  { value: "operational", label: "Operational", tone: "blue" },
  { value: "finance", label: "Finance", tone: "emerald" },
  { value: "travel_admin", label: "Travel Admin", tone: "emerald" },
  { value: "travel_finance", label: "Travel Finance", tone: "emerald" },
  { value: "travel_operational", label: "Travel Operational", tone: "emerald" },
  { value: "travel_agent", label: "Travel Agent", tone: "amber" },
  { value: "muthawwif", label: "Muthawwif", tone: "amber" },
  { value: "customer", label: "Customer", tone: "slate" },
];

// Roles allowed to open the admin panel; every other role lands on /unauthorized.
export const ADMIN_PANEL_ROLES = ["admin", "operational", "finance"];

export const ROLE_OPTIONS = ROLES.map((role) => role.label);

export function roleParts(value) {
  const byValue = ROLES.find((role) => role.value === value);
  if (byValue) return byValue;
  // Seeded/legacy rows stored the human label instead of the slug.
  const byLabel = ROLES.find((role) => role.label === value);
  return byLabel ?? { value: value ?? "", label: value ?? "", tone: "slate" };
}
