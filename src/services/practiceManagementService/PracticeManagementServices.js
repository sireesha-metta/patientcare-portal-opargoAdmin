import opargoAdminClient, { optimizerClient } from "../api/apiClient";
import { unwrapResponse } from "../../utils/apiError";

function practiceHeaders(practiceId) {
  return { user_practice_id: String(practiceId) };
}

function asList(payload, key) {
  const body = unwrapResponse(payload);
  if (Array.isArray(body?.[key])) return body[key];
  if (Array.isArray(body)) return body;
  return [];
}

export async function getPractices() {
  const response = await opargoAdminClient.get("/practices");
  return asList(response.data, "practices");
}

export async function uploadPracticeXml(file) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await opargoAdminClient.post("/uploadPracticeFile", formData);
  return unwrapResponse(response.data);
}

export async function uploadPracticeLogo(file, practiceId) {
  const formData = new FormData();
  formData.append("customer_practice_logo", file);
  const response = await opargoAdminClient.post("/uploadcustomerlogo", formData, {
    headers: practiceHeaders(practiceId),
  });
  return response.data;
}

export async function getPmsTypes() {
  const response = await opargoAdminClient.post("/pmsTypes", {});
  return asList(response.data, "pmsTypes");
}

export async function getPmsEnv(pmsType) {
  const response = await opargoAdminClient.post("/pmsEnvironment", { pms_type: pmsType });
  return asList(response.data, "pmsInfo");
}

export async function addOpargoPractice(form) {
  const response = await opargoAdminClient.post("/addPractice", {
    addPracticeObj: {
      pms_type: form.pms_type,
      practice_environment_id: form.practice_environment_id,
      practice_name: form.practice_name,
      as_api_username: form.as_api_username,
      pms_username: form.pms_username,
      pms_userpwd: form.pms_userpwd,
      practice_timezone: form.practice_timezone,
      pms_site_id: form.pms_site_id,
      pms_userid: form.pms_userid,
      pms_practice_id: form.pms_practice_id,
      centricity_endpoint: form.centricity_endpoint,
      centricity_db: form.centricity_db,
      practice_isDemo: form.practice_isDemo ? "Yes" : "No",
      practiceTypeAbbreviation: "SO",
    },
  });
  return unwrapResponse(response.data);
}

export async function getPracticeAdmins(practiceId) {
  const response = await opargoAdminClient.get("/admins", {
    headers: practiceHeaders(practiceId),
  });
  return asList(response.data, "practice_admins");
}

export async function getPracticeManagers(practiceId) {
  const response = await opargoAdminClient.post(
    "/getManagers",
    {},
    { headers: practiceHeaders(practiceId) },
  );
  return asList(response.data, "practice_managers");
}

export async function getProgramCoordinators(practiceId) {
  const response = await opargoAdminClient.get("/admins", {
    headers: {
      ...practiceHeaders(practiceId),
      user_reqFrom: "ProgramCoordinator",
    },
  });
  return asList(response.data, "practice_admins");
}

export async function sendNewAdminEmail(practiceId, practiceName, username) {
  const response = await opargoAdminClient.post(
    "/sendNewAdminEmail",
    { username, admin_practice_name: practiceName },
    { headers: practiceHeaders(practiceId) },
  );
  return unwrapResponse(response.data);
}

export async function deletePracticeAdmin(practiceId, adminId) {
  const response = await opargoAdminClient.post(
    "/deleteAdmin",
    { admin_id: adminId },
    { headers: practiceHeaders(practiceId) },
  );
  return unwrapResponse(response.data);
}

export async function deletePracticeManager(practiceId, userId) {
  const response = await opargoAdminClient.post(
    "/deleteManager",
    { practice_users_id: userId, user_practice_id: practiceId },
    { headers: practiceHeaders(practiceId) },
  );
  return unwrapResponse(response.data);
}

export async function deleteProgramCoordinator(practiceId, coordinatorId) {
  const response = await opargoAdminClient.post(
    "/programcoordinator",
    { coordinator_id: coordinatorId },
    { headers: practiceHeaders(practiceId) },
  );
  return unwrapResponse(response.data);
}

export async function getChildSitePractices(practiceId) {
  const response = await opargoAdminClient.get("/child_site_practices", {
    headers: practiceHeaders(practiceId),
  });
  return asList(response.data, "childSitePractices");
}

export async function deleteChildPractice(childSiteId) {
  const response = await opargoAdminClient.delete("/child_site_practice", {
    data: { child_site_id: childSiteId },
  });
  return unwrapResponse(response.data);
}

export async function startPracticeBatch(practiceId) {
  const response = await optimizerClient.post("/optimizer/batch", {
    practice_id: practiceId,
  });
  return unwrapResponse(response.data);
}

export async function renewPracticeApiKeys(practiceId, practiceName) {
  const response = await opargoAdminClient.post("/credentials/renew", {
    practiceId,
    practiceName,
  });
  return unwrapResponse(response.data) || response.data;
}
