import axios from "axios";
import { sharedUiService } from "patientcare-portal-sharedui/sharedUiService";
import { OPARGOADMIN_API_BASE_URL } from "../../config/opargoAdminConfig";

function acceptNoContent(status) {
  return (status >= 200 && status < 300) || status === 204;
}

function authHeaders() {
  let userDetails = sharedUiService.getUserDetails();
  if (!userDetails) {
    try {
      const raw = sessionStorage.getItem("userDetails");
      userDetails = raw ? JSON.parse(raw) : null;
      if (userDetails) sharedUiService.setUserDetails(userDetails);
    } catch {
      userDetails = null;
    }
  }

  const practiceRole = userDetails?.roles?.practicerole?.[0];
  if (!userDetails || !practiceRole) return {};

  return {
    username: userDetails.username,
    id: String(userDetails.id),
    practice_id: String(practiceRole.practice_id),
    user_practice_id: String(practiceRole.practice_id),
    session: userDetails.session,
    practice: practiceRole.practice_name,
  };
}

function attachAuth(instance) {
  instance.interceptors.request.use((config) => {
    Object.entries(authHeaders()).forEach(([key, value]) => {
      if (value == null) return;
      if (typeof config.headers.set === "function") {
        if (!config.headers.get(key)) config.headers.set(key, value);
      } else if (!config.headers[key]) {
        config.headers[key] = value;
      }
    });
    if (config.data instanceof FormData) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  });
  return instance;
}

/** Angular PracticemanagementService: environment.baseURL + '/opargoAdmin/...' */
export const opargoAdminClient = attachAuth(
  axios.create({
    baseURL: `${OPARGOADMIN_API_BASE_URL}/opargoAdmin`,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
    validateStatus: acceptNoContent,
  }),
);

export const userServicesClient = attachAuth(
  axios.create({
    baseURL: `${OPARGOADMIN_API_BASE_URL}/userServices`,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
    validateStatus: acceptNoContent,
  }),
);

export const optimizerClient = attachAuth(
  axios.create({
    baseURL: OPARGOADMIN_API_BASE_URL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
    validateStatus: acceptNoContent,
  }),
);

export default opargoAdminClient;
