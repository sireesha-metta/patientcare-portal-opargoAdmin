import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import CustomModal from "../../components/modal/CustomModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import {deletePracticeGroupSite, getPracticeGroupDetails,} from "../../services/practiceGroupService/PracticeGroupServices";
import { getApiErrorMessage } from "../../utils/apiError";

function sortByPracticeName(list) {
  return [...(list || [])].sort((a, b) =>
    String(a?.practice_name || "").localeCompare(String(b?.practice_name || "")),
  );
}

export default function PracticeGroupRemoveSitesModal({ open, group, onClose, onChanged, toast }) {
  const [practices, setPractices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadPractices = useCallback(async () => {
    if (!group?.id) return;
    setBusy(true);
    try {
      setPractices(sortByPracticeName(await getPracticeGroupDetails(group.id)));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setPractices([]);
    } finally {
      setBusy(false);
    }
  }, [group, toast]);

  useEffect(() => {
    if (!open) return;
    void loadPractices();
  }, [open, loadPractices]);

  const confirmDelete = async () => {
    if (!pendingDelete || !group) return;
    setBusy(true);
    try {
      const result = await deletePracticeGroupSite(
        group.id,
        pendingDelete.practice_id,
        group.practice_group_name,
      );
      if (result === true) {
        toast.success("Site deleted successfully from practice group");
        setPendingDelete(null);
        await loadPractices();
        await onChanged?.();
      } else {
        toast.error("Site deleted from practice group failed");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <CustomModal
        open={open}
        onClose={onClose}
        title={
          <span>
            {group?.practice_group_name} /{" "}
            <small className="font-normal text-slate-500">Remove Group Members</small>
          </span>
        }
        actionText=""
        cancelText="Close"
        maxWidth="2xl"
      >
        {busy ? <LoaderComponent fullScreen text="Loading..." /> : null}
        {!practices.length ? (
          <p className="py-6 text-center text-sm text-slate-600">No Practice Groups</p>
        ) : (
          <div>
            <h4 className="mb-3 text-base font-semibold text-slate-800">Practice/Site</h4>
            <table className="w-full text-sm">
              <tbody>
                {practices.map((practice) => (
                  <tr key={practice.practice_id ?? practice.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-800">{practice.practice_name}</td>
                    <td className="w-12 py-2 text-right">
                      <button
                        type="button"
                        title="Delete"
                        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
                        onClick={() => setPendingDelete(practice)}
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
      </CustomModal>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Site From Practice Group"
        confirmText="Delete Practice"
        message={
          <>
            Do you want to remove <b>{pendingDelete?.practice_name} </b> from{" "}
            <b>{group?.practice_group_name}</b> practice group?
            <br />
            <span className="mt-3 block text-red-600">
              <b>Warning:</b> Removing this Practice/Site from the Group will disconnect all Multi
              Site User Permissions into or out of this Site. THIS ACTION CANNOT BE UNDONE.
            </span>
          </>
        }
      />
    </>
  );
}
