import { useState } from "react";
import SharedUiProvider from "patientcare-portal-sharedui/SharedUiProvider";
import { sharedUiService } from "patientcare-portal-sharedui/sharedUiService";
import OpargoAdminLeft from "./components/opargoAdminLeft/OpargoAdminLeft";
import { getOpargoAdminMenu, setOpargoAdminMenu } from "./config/opargoAdminNav";
import { MENU, OPARGOADMIN_API_BASE_URL } from "./config/opargoAdminConfig";
import PracticeManagement from "./pages/practiceManagement/PracticeManagement";
import PracticeGroups from "./pages/practiceGroups/PracticeGroups";
import SmartReachPayers from "./pages/smartReachPayers/SmartReachPayers";

function readSession() {
  let userDetails;
  try {
    const raw = sessionStorage.getItem("userDetails");
    userDetails = raw ? JSON.parse(raw) : undefined;
  } catch {
    userDetails = undefined;
  }

  const baseUrl = sharedUiService.getBaseUrl() || OPARGOADMIN_API_BASE_URL;
  const role =
    userDetails?.roles?.opargositerole ||
    userDetails?.roles?.practicerole?.[0]?.rolename ||
    userDetails?.role ||
    "";

  sharedUiService.setBaseUrl(baseUrl);
  if (userDetails) {
    sharedUiService.setUserDetails(userDetails);
    sharedUiService.setAuthentication();
    if (role) sharedUiService.setRole(role);
  }

  return { baseUrl, role, userDetails, authenticated: Boolean(userDetails) };
}

function AppContent() {
  const [activePage, setActivePage] = useState(getOpargoAdminMenu);

  const handleSelect = (id) => {
    setOpargoAdminMenu(id);
    setActivePage(id);
  };

  const renderContent = () => {
    switch (activePage) {
      case MENU.GROUPS:
        return <PracticeGroups />;
      case MENU.PAYERS:
        return <SmartReachPayers />;
      case MENU.PRACTICE:
      default:
        return <PracticeManagement />;
    }
  };

  return (
    <>
      <div className="hidden md:block">
        <div className="pcp-module">
          <OpargoAdminLeft activePage={activePage} onSelect={handleSelect} />
          <div className="pcp-module__content">{renderContent()}</div>
        </div>
      </div>
      <div className="px-6 py-16 text-center md:hidden">
        <h2 className="text-xl font-semibold text-slate-900">Opargo Admin Unavailable</h2>
        <p className="mt-3 text-sm text-slate-600">
          Opargo Admin is currently not available on mobile platforms. Please log
          into Opargo on a desktop to access Opargo admin settings.
          <br />
          Thank you.
        </p>
      </div>
    </>
  );
}

export default function App() {
  return (
    <SharedUiProvider initialState={readSession()}>
      <AppContent />
    </SharedUiProvider>
  );
}
