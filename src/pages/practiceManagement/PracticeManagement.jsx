import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, Image as ImageIcon, Key, MoreVertical, Plus, Settings, Users } from "lucide-react";
import { useSharedUi } from "patientcare-portal-sharedui/useSharedUi";
import DataTable from "../../components/table/DataTable";
import ConfirmModal from "../../components/modal/ConfirmModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import {getPractices,startPracticeBatch,uploadPracticeXml,} from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage, getResponseMessage, toTitleCase, unwrapResponse } from "../../utils/apiError";
import PracticeAddModal from "./PracticeAddModal";
import PracticeLogoModal from "./PracticeLogoModal";
import PracticeUsersModal from "./PracticeUsersModal";
import ChildPracticesModal from "./ChildPracticesModal";
import ApiKeyModal from "./ApiKeyModal";

function isGsPractice(practice) {
  return Boolean(practice?.isGSPractice);
}

function canRenewApiKeys(practice) {
  return (
    practice?.isGSPractice === true &&
    practice?.proactivecare_engine_site === false &&
    practice?.patient_facing_site === false
  );
}

function canShowSmartReach(practice) {
  return Boolean(practice?.proactivecare_engine_site && practice?.patient_facing_site);
}

function demoLabel(value) {
  if (value === null || value === undefined) return "N/A";
  return toTitleCase(String(value));
}

export default function PracticeManagement() {
  const { toast } = useSharedUi();
  const menuRef = useRef(null);
  const xmlInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [practices, setPractices] = useState([]);
  const [xmlFile, setXmlFile] = useState(null);
  const [xmlInvalid, setXmlInvalid] = useState(false);
  const [xmlDisabled, setXmlDisabled] = useState(false);
  const [xmlSuccess, setXmlSuccess] = useState("");
  const [xmlError, setXmlError] = useState("");
  const [menu, setMenu] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [logoPractice, setLogoPractice] = useState(null);
  const [usersModal, setUsersModal] = useState(null);
  const [childPractice, setChildPractice] = useState(null);
  const [apiKeyPractice, setApiKeyPractice] = useState(null);
  const [pendingBatch, setPendingBatch] = useState(null);

  const loadPractices = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPractices();
      setPractices(
        [...(list || [])].sort((a, b) =>
          String(a?.practice_name || "").localeCompare(String(b?.practice_name || "")),
        ),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setPractices([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async page load
    void loadPractices();
  }, [loadPractices]);

  useEffect(() => {
    if (!menu) return undefined;
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenu(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  const handleXmlChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "text/xml") {
      setXmlInvalid(true);
      setXmlDisabled(true);
      setXmlFile(null);
      setXmlSuccess("");
      setXmlError("");
      return;
    }
    setXmlInvalid(false);
    setXmlDisabled(false);
    setXmlFile(file);
    setXmlSuccess("");
    setXmlError("");
  };

  const handleXmlSubmit = async (event) => {
    event.preventDefault();
    if (!xmlFile) {
      setXmlInvalid(true);
      return;
    }
    setBusy(true);
    try {
      const data = await uploadPracticeXml(xmlFile);
      const body = unwrapResponse(data);
      if (body.status === "success") {
        setXmlSuccess("Successfully Uploaded Practice XML");
        setXmlError("");
        setXmlFile(null);
        if (xmlInputRef.current) xmlInputRef.current.value = "";
      } else {
        setXmlError(body.message || getResponseMessage(data) || "Something went wrong.");
        setXmlSuccess("");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmBatch = async () => {
    if (!pendingBatch) return;
    setBusy(true);
    try {
      await startPracticeBatch(pendingBatch.id);
      setPendingBatch(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "practice_name",
        header: "Practice Name",
        minWidth: 220,
        sort: "asc",
      },
      {
        accessorKey: "practicetype",
        header: "Practice Type",
        minWidth: 160,
        Cell: ({ row }) => toTitleCase(row?.practicetype),
      },
      {
        accessorKey: "practiceisDemo",
        header: "Demo/Test",
        minWidth: 120,
        Cell: ({ row }) => demoLabel(row?.practiceisDemo),
      },
      {
        id: "logo",
        header: "Logo",
        minWidth: 80,
        enableSorting: false,
        enableExport: false,
        Cell: ({ row }) => (
          <button
            type="button"
            title="Upload logo"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={() => setLogoPractice(row)}
          >
            <ImageIcon size={18} />
          </button>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        minWidth: 90,
        enableSorting: false,
        enableColumnFilter: false,
        enableExport: false,
        Cell: ({ row }) => (
          <button
            type="button"
            title="Actions"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setMenu({ row, x: rect.right, y: rect.bottom });
            }}
          >
            <MoreVertical size={18} />
          </button>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6">
        <LoaderComponent text="Loading please wait..." />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6">
      {busy ? <LoaderComponent fullScreen text="Please wait..." /> : null}

      <h1 className="text-2xl font-bold text-slate-900">Upload Practice Data</h1>
      <form className="mt-4 max-w-3xl" onSubmit={handleXmlSubmit}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="w-40 text-sm text-slate-700">Practice XML File:</label>
          <input
            ref={xmlInputRef}
            type="file"
            name="practiceXML"
            accept="text/xml"
            onChange={handleXmlChange}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={xmlDisabled}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit
          </button>
        </div>
        {xmlSuccess ? <p className="mt-2 text-sm text-green-600">{xmlSuccess}</p> : null}
        {xmlError ? <p className="mt-2 text-sm text-red-600">{xmlError}</p> : null}
        {xmlInvalid ? <p className="mt-2 text-sm text-red-600">Please select an XML file to continue</p> : null}
      </form>

      <hr className="my-6 border-slate-200" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Practices</h1>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Practice
        </button>
      </div>

      <DataTable
        columns={columns}
        data={practices}
        fileName="Practices"
        pageSize={10}
        overlayNoRowsTemplate="No Practices"
        quickFilterPlaceholder="Search Practices"
        getRowId={(params) => String(params.data?.id ?? params.data?.practice_name)}
        height={520}
      />

      {menu ? (
        <div
          ref={menuRef}
          className="fixed z-[10001] min-w-[220px] rounded-md border border-slate-200 bg-white py-1 shadow-lg"
          style={{ top: menu.y + 4, left: menu.x - 220 }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setUsersModal({ type: "admins", practice: menu.row });
              setMenu(null);
            }}
          >
            <Users size={14} /> View Admins
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              toast.info("Manage Settings will be ported next.");
              setMenu(null);
            }}
          >
            <Settings size={14} /> Manage Settings
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setPendingBatch(menu.row);
              setMenu(null);
            }}
          >
            <Clock size={14} /> Start Batch
          </button>
          {isGsPractice(menu.row) ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setUsersModal({ type: "managers", practice: menu.row });
                setMenu(null);
              }}
            >
              <Users size={14} /> View Managers
            </button>
          ) : null}
          {canShowSmartReach(menu.row) ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setUsersModal({ type: "coordinators", practice: menu.row });
                setMenu(null);
              }}
            >
              <Users size={14} /> SmartReach
            </button>
          ) : null}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setChildPractice(menu.row);
              setMenu(null);
            }}
          >
            <Users size={14} /> Child Practices
          </button>
          {canRenewApiKeys(menu.row) ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setApiKeyPractice(menu.row);
                setMenu(null);
              }}
            >
              <Key size={14} /> Renew API Keys
            </button>
          ) : null}
        </div>
      ) : null}

      <PracticeAddModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        practices={practices}
        onClose={() => setAddOpen(false)}
        onSaved={async () => {
          setAddOpen(false);
          await loadPractices();
        }}
        toast={toast}
      />
      <PracticeLogoModal
        key={logoPractice?.id || "logo-closed"}
        open={Boolean(logoPractice)}
        practice={logoPractice}
        onClose={() => setLogoPractice(null)}
        onSaved={async () => {
          setLogoPractice(null);
          await loadPractices();
        }}
        toast={toast}
      />
      <PracticeUsersModal
        key={usersModal ? `${usersModal.type}-${usersModal.practice?.id}` : "users-closed"}
        open={Boolean(usersModal)}
        type={usersModal?.type}
        practice={usersModal?.practice}
        onClose={() => setUsersModal(null)}
        toast={toast}
      />
      <ChildPracticesModal
        key={childPractice?.id || "child-closed"}
        open={Boolean(childPractice)}
        practice={childPractice}
        onClose={() => setChildPractice(null)}
        toast={toast}
      />
      <ApiKeyModal
        key={apiKeyPractice?.id || "api-keys-closed"}
        open={Boolean(apiKeyPractice)}
        practice={apiKeyPractice}
        onClose={() => setApiKeyPractice(null)}
        toast={toast}
      />
      <ConfirmModal
        open={Boolean(pendingBatch)}
        onClose={() => setPendingBatch(null)}
        onConfirm={confirmBatch}
        title="Start Batch Confirmation"
        message={
          <>
            Initiating a batch manually will immediately alter inventory optimization. Do you want to
            initiate a batch for <b>{pendingBatch?.practice_name}</b>?
          </>
        }
        confirmText="Confirm"
      />
    </div>
  );
}
