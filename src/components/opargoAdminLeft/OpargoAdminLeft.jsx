import SideNav from "patientcare-portal-sharedui/SideNav";
import { OPARGOADMIN_NAV_ITEMS } from "../../config/opargoAdminNav";


export default function OpargoAdminLeft({ activePage, onSelect }) {
  return (
    <SideNav
      title="Opargo Admin"
      items={OPARGOADMIN_NAV_ITEMS}
      activeId={activePage}
      onSelect={onSelect}
    />
  );
}
