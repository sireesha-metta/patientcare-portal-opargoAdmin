import opargoAdminClient from "../api/apiClient";
import { unwrapResponse } from "../../utils/apiError";

function getResult(payload) {
  return unwrapResponse(payload)?.result;
}

function asResultList(payload) {
  const result = getResult(payload);
  return Array.isArray(result) ? result : [];
}

export async function getPracticeGroups() {
  const response = await opargoAdminClient.get("/practiceGroups");
  return asResultList(response.data);
}

export async function getNonPracticeGroupsPractices() {
  const response = await opargoAdminClient.get("/nonPracticeGroupsPractices");
  return asResultList(response.data);
}

export async function addPracticeGroup(practiceGroupName, practiceId) {
  const response = await opargoAdminClient.post("/addPracticeGroup", {
    practice_group_name: practiceGroupName,
    practice_id: Number(practiceId),
  });
  return getResult(response.data);
}

export async function getPracticeGroupDetails(practiceGroupId) {
  const response = await opargoAdminClient.post("/practiceGroupDetails", {
    practice_group_id: practiceGroupId,
  });
  const result = getResult(response.data);
  return Array.isArray(result?.practices) ? result.practices : [];
}

export async function getPracticeGroupAvailPractices(practiceGroupId, pmsType) {
  const response = await opargoAdminClient.post("/practiceGroupAvailPractices", {
    practice_group_id: practiceGroupId,
    pms_type: pmsType,
  });
  return asResultList(response.data);
}

export async function addPracticeGroupSite(practiceGroupId, practiceId, practiceGroupName) {
  const response = await opargoAdminClient.post("/addPracticeGroupPractice", {
    practice_group_id: practiceGroupId,
    practice_id: practiceId,
    practice_group_name: practiceGroupName,
  });
  return getResult(response.data);
}

export async function deletePracticeGroupSite(practiceGroupId, practiceId, practiceGroupName) {
  const response = await opargoAdminClient.post("/removePracticeGroupPractice", {
    practice_group_id: practiceGroupId,
    practice_id: practiceId,
    practice_group_name: practiceGroupName,
  });
  return getResult(response.data);
}
