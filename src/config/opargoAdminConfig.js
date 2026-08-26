
export const OPARGOADMIN_API_BASE_URL =
  import.meta.env.VITE_OPARGOADMIN_API_BASE_URL || "/opargoapp";

export const MENU = {
  PRACTICE: "admin",
  GROUPS: "group",
  PAYERS: "payergroup",
};

export const TIMEZONES = [
  { id: 1, name: "US/Eastern" },
  { id: 2, name: "US/Central" },
  { id: 3, name: "US/Mountain" },
  { id: 4, name: "US/Pacific" },
  { id: 5, name: "US/Hawaii" },
];
