import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import CustomModal from "../../components/modal/CustomModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import {deletePracticeAdmin,deletePracticeManager,deleteProgramCoordinator,getPracticeAdmins,getPracticeManagers,
  getProgramCoordinators,sendNewAdminEmail,} from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage, getResponseMessage } from "../../utils/apiError";

const VARIANTS = {
  admins: {
    title: (name) => `Practice Admins for ${name}`,
    empty: "No Practice Admins",
    heading: "Practice Admins",
    load: getPracticeAdmins,
    delete: (practiceId, user) => deletePracticeAdmin(practiceId, user.id),
    success: "practice admin deleted",
  },
  managers: {
    title: (name) => `Practice Managers for  ${name}`,
    empty: "No Practice Managers",
    heading: "Managers",
    load: getPracticeManagers,
    delete: (practiceId, user) => deletePracticeManager(practiceId, user.id),
    success: "practice manager deleted",
  },
  coordinators: {
    title: (name) => `Program Coordinator for  ${name}`,
    empty: "No  Program Coordinator",
    heading: "Program Coordinators",
    load: getProgramCoordinators,
    delete: (practiceId, user) => deleteProgramCoordinator(practiceId, user.id),
    success: "program coordinator deleted",
  },
};

function sortByUsername(list) {
  return [...(list || [])].sort((a, b) =>
    String(a?.username || "").localeCompare(String(b?.username || "")),
  );
}

export default function PracticeUsersModal({ open, type, practice, onClose, toast }) {
  const variant = VARIANTS[type] || VARIANTS.admins;
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [emailUsername, setEmailUsername] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadUsers = useCallback(async () => {
    if (!practice?.id) return;
    setBusy(true);
    try {
      setUsers(sortByUsername(await variant.load(practice.id)));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setUsers([]);
    } finally {
      setBusy(false);
    }
  }, [practice, toast, variant]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async list load
    void loadUsers();
  }, [open, loadUsers]);

  const handleSendEmail = async () => {
    const username = emailUsername.trim();
    if (!username) {
      toast.error("Please enter all required fields");
      return;
    }
    setBusy(true);
    try {
      const data = await sendNewAdminEmail(practice.id, practice.practice_name, username);
      const message = getResponseMessage(data);
      if (message === "Email to admin sent") {
        toast.success(message);
        onClose();
      } else {
        toast.error(message || getApiErrorMessage({}, "Something went wrong."));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      const data = await variant.delete(practice.id, pendingDelete);
      const message = getResponseMessage(data);
      if (message === variant.success) {
        toast.success(message);
        setPendingDelete(null);
        await loadUsers();
      } else {
        toast.error(message || getApiErrorMessage({}, "Something went wrong."));
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const deleteMessage =
    type === "admins"
      ? `Do you want to remove *${pendingDelete?.firstname || ""} ${pendingDelete?.lastname || ""}* from the practice? `
      : `Do you want to remove ${pendingDelete?.firstname || ""} ${pendingDelete?.lastname || ""} from the practice? `;

  return (
    <>
      <CustomModal
        open={open}
        onClose={onClose}
        title={variant.title(practice?.practice_name || "")}
        actionText=""
        cancelText="Close"
        maxWidth="3xl"
      >
        {busy ? <LoaderComponent fullScreen text="Please wait..." /> : null}
        <div className="space-y-4">
          {type === "admins" ? (
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-slate-800">Send Email to Practice Admin</h4>
              <label className="block text-sm font-medium text-slate-700">
                User Name
                <input
                  value={emailUsername}
                  onChange={(event) => setEmailUsername(event.target.value)}
                  maxLength={30}
                  autoComplete="new-username"
                  placeholder="User Name"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={handleSendEmail}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Send Email
              </button>
            </div>
          ) : null}

          {!users.length ? (
            <p className="py-6 text-center text-sm text-slate-600">{variant.empty}</p>
          ) : (
            <div className={type === "admins" ? "border-t border-slate-200 pt-4" : ""}>
              <h4 className="mb-3 text-base font-semibold text-slate-800">{variant.heading}</h4>
              <table className="w-full text-sm">
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-800">{user.username}</td>
                      <td className="w-12 py-2 text-right">
                        <button
                          type="button"
                          title="Delete"
                          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
                          onClick={() => setPendingDelete(user)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CustomModal>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete User "
        message={deleteMessage}
        confirmText="Delete"
      />
    </>
  );
}
