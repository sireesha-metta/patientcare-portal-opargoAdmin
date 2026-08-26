import opargoAdminClient from "../api/apiClient";
import { unwrapResponse } from "../../utils/apiError";

export async function getSmartReachPayers() {
  const response = await opargoAdminClient.get("/smartreachpayer");
  const body = unwrapResponse(response.data);
  const rows = Array.isArray(body?.smartReachPayers) ? body.smartReachPayers : [];
  return { rows, status: response.status };
}

export async function addSmartReachPayer(payerName, payerId) {
  const response = await opargoAdminClient.post("/smartreachpayer", {
    payerName,
    payerId,
  });
  return response.data;
}

export async function updateSmartReachPayer(id, payerName, payerId) {
  const response = await opargoAdminClient.put("/smartreachpayer", {
    id,
    payerName,
    payerId,
  });
  return response.data;
}
