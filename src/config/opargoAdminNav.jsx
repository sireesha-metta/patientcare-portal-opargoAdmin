import { BarChart3, Heart, List } from "lucide-react";
import { MENU } from "./opargoAdminConfig";

const MENU_STORAGE_KEY = "opargoadminLeftMenuType";

export const OPARGOADMIN_NAV_ITEMS = [
  {
    id: MENU.PRACTICE,
    label: "Practice Management",
    icon: <BarChart3 size={20} />,
  },
  {
    id: MENU.GROUPS,
    label: "Practice Groups",
    icon: <List size={20} />,
  },
  {
    id: MENU.PAYERS,
    label: "SmartReach Payers",
    icon: <Heart size={20} />,
  },
];

const MENU_IDS = new Set(OPARGOADMIN_NAV_ITEMS.map((item) => item.id));

export function getOpargoAdminMenu() {
  try {
    const stored = sessionStorage.getItem(MENU_STORAGE_KEY);
    if (stored && MENU_IDS.has(stored)) return stored;
  } catch {
  }
  return MENU.PRACTICE;
}

export function setOpargoAdminMenu(id) {
  if (!MENU_IDS.has(id)) return;
  try {
    sessionStorage.setItem(MENU_STORAGE_KEY, id);
  } catch {
  }
}
