/**
 * API base path for Opargo Admin.
 * Angular used environment.baseURL + '/opargoAdmin/...'; the Vite proxy forwards /opargoapp.
 */
export const OPARGOADMIN_API_BASE_URL =
  import.meta.env.VITE_OPARGOADMIN_API_BASE_URL || "/opargoapp";

export const MENU = {
  PRACTICE: "admin",
  GROUPS: "group",
  PAYERS: "payergroup",
};
