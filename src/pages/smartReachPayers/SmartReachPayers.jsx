import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useSharedUi } from "patientcare-portal-sharedui/useSharedUi";
import DataTable from "../../components/table/DataTable";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { getSmartReachPayers, updateSmartReachPayer,} from "../../services/smartReachPayerService/SmartReachPayerServices";
import { getApiErrorMessage, getResponseMessage } from "../../utils/apiError";
import SmartReachPayerAddModal from "./SmartReachPayerAddModal";

const ALPHANUMERIC = /^[0-9a-zA-Z]+$/;

function sortByName(list) {
  return [...(list || [])].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
}

export default function SmartReachPayers() {
  const { toast } = useSharedUi();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payers, setPayers] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", payerId: "" });
  const [nameError, setNameError] = useState("");
  const [idError, setIdError] = useState("");

  const loadPayers = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { rows, status } = await getSmartReachPayers();
      setPayers(sortByName(rows));
      if (status === 204) toast.info("No payers data found");
    } catch {
      toast.error("Unable to get the payer data ");
      setPayers([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async page load
    void loadPayers();
  }, [loadPayers]);

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ name: "", payerId: "" });
    setNameError("");
    setIdError("");
  };

  const startEdit = (row) => {
    if (editingId != null && editingId !== row.id) {
      toast.error("Please edit only one PayerGroup Name at a time");
      return;
    }
    setEditingId(row.id);
    setDraft({ name: row.name || "", payerId: row.payerId == null ? "" : String(row.payerId) });
    setNameError("");
    setIdError("");
  };

  const saveEdit = async (row) => {
    const editedName = draft.name;
    const editedPayerId = draft.payerId;
    if (String(editedName).trim() === "") {
      setNameError("Payer name cannot be empty.");
      return;
    }
    if (!ALPHANUMERIC.test(editedPayerId)) {
      setIdError(editedPayerId === "" ? "Payer Id cannot be empty or 0" : "Payer Id should have numbers and alphabets");
      return;
    }
    if (payers.some((item) => item.id !== row.id && item.name === editedName)) {
      setNameError("Payer name already exists.");
      return;
    }
    if (payers.some((item) => item.id !== row.id && String(item.payerId) === String(editedPayerId))) {
      setIdError("Payer Id already exists.");
      return;
    }

    const original = payers.find((item) => item.id === row.id);
    if (original && editedName === original.name && String(editedPayerId) === String(original.payerId)) {
      cancelEdit();
      return;
    }

    setBusy(true);
    try {
      const data = await updateSmartReachPayer(row.id, editedName.trim(), editedPayerId);
      const message = getResponseMessage(data);
      if (message === "SmartReach payer name updated successfully") {
        toast.success(message);
      } else if (message) {
        toast.error(message);
      }
      cancelEdit();
      await loadPayers({ silent: true });
    } catch (error) {
      toast.error(
        error?.response?.status === 500
          ? getApiErrorMessage(error)
          : getApiErrorMessage(error, "Something went wrong."),
      );
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Payers Name",
      minWidth: 280,
      sort: "asc",
      Cell: ({ row }) =>
        editingId === row.id ? (
          <div>
            <input
              value={draft.name}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((current) => ({ ...current, name: value }));
                setNameError(value !== "" ? "" : "Payer name cannot be empty.");
              }}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            {nameError ? <p className="mt-1 text-xs text-red-600">{nameError}</p> : null}
          </div>
        ) : (
          row.name
        ),
    },
    {
      accessorKey: "payerId",
      header: "Payer Id",
      minWidth: 160,
      Cell: ({ row }) =>
        editingId === row.id ? (
          <div>
            <input
              maxLength={20}
              value={draft.payerId}
              onChange={(event) => {
                const value = event.target.value;
                setDraft((current) => ({ ...current, payerId: value }));
                setIdError(value !== "" ? "" : "Payer Id cannot be empty or 0");
              }}
              className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
            {idError ? <p className="mt-1 text-xs text-red-600">{idError}</p> : null}
          </div>
        ) : (
          row.payerId
        ),
    },
    {
      colId: "modify",
      header: "Modify",
      minWidth: 160,
      enableSorting: false,
      enableColumnFilter: false,
      enableExport: false,
      Cell: ({ row }) =>
        editingId === row.id ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => saveEdit(row)}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            title="Edit"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={() => startEdit(row)}
          >
            <Pencil size={16} />
          </button>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6">
        <LoaderComponent text="Please wait ... " />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6">
      {busy ? <LoaderComponent fullScreen text="Please wait ... " /> : null}

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">SmartReach Payers</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Payer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payers}
        fileName="SmartReachPayers"
        pageSize={10}
        overlayNoRowsTemplate="No payers data found"
        quickFilterPlaceholder="Search payer"
        getRowId={(params) => String(params.data?.id ?? params.data?.payerId)}
        height={520}
      />

      <SmartReachPayerAddModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        payers={payers}
        onClose={() => setAddOpen(false)}
        onSaved={async () => {
          setAddOpen(false);
          await loadPayers({ silent: true });
        }}
        toast={toast}
      />
    </div>
  );
}
