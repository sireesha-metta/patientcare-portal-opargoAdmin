import { BarChart3, Heart, List } from "lucide-react";
import { MENU } from "../../config/opargoAdminConfig";

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
