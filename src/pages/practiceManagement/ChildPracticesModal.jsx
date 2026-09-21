import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import CustomModal from "../../components/modal/CustomModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import DataTable from "../../components/table/DataTable";
import {deleteChildPractice,getChildSitePractices,} from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage, getResponseMessage } from "../../utils/apiError";

export default function ChildPracticesModal({ open, practice, onClose, toast }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadRows = useCallback(async () => {
    if (!practice?.id) return;
    setBusy(true);
    try {
      const list = await getChildSitePractices(practice.id);
      setRows(
        [...(list || [])].sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""))),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [practice, toast]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list load
    void loadRows();
  }, [open, loadRows]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      const data = await deleteChildPractice(pendingDelete.id);
      const message = getResponseMessage(data);
      if (message === "Child practice deleted") {
        toast.success(message);
        setPendingDelete(null);
        await loadRows();
      } else {
        toast.error(message || getApiErrorMessage({}, "Something went wrong."));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Practice Name",
        minWidth: 220,
        sort: "asc",
      },
      {
        id: "delete",
        header: "Delete",
        minWidth: 90,
        enableSorting: false,
        enableColumnFilter: false,
        enableExport: false,
        Cell: ({ row }) => (
          <button
            type="button"
            title="Delete"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={() => setPendingDelete(row)}
          >
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <CustomModal
        open={open}
        onClose={onClose}
        title={`Child Practices for ${practice?.practice_name || ""}`}
        actionText=""
        cancelText="Close"
        maxWidth="3xl"
      >
        {busy ? <LoaderComponent fullScreen text="Please wait..." /> : null}
        <DataTable
          columns={columns}
          data={rows}
          fileName="ChildPractices"
          pageSize={10}
          overlayNoRowsTemplate="No Child Practices"
          quickFilterPlaceholder="Search Name"
          getRowId={(params) => String(params.data?.id ?? params.data?.name)}
          height={360}
        />
      </CustomModal>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete child practice "
        message={`Do you want to remove *${pendingDelete?.name || ""}* from the practice ? `}
        confirmText="Delete"
      />
    </>
  );
}
