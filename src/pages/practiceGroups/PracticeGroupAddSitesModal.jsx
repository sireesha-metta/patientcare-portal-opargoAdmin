import { useCallback, useEffect, useState } from "react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { addPracticeGroupSite, getPracticeGroupAvailPractices, getPracticeGroupDetails,} from "../../services/practiceGroupService/PracticeGroupServices";
import { getApiErrorMessage } from "../../utils/apiError";

function sortByPracticeName(list) {
  return [...(list || [])].sort((a, b) =>
    String(a?.practice_name || "").localeCompare(String(b?.practice_name || "")),
  );
}

export default function PracticeGroupAddSitesModal({ open, group, onClose, toast }) {
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadLists = useCallback(async () => {
    if (!group?.id) return;
    setBusy(true);
    try {
      const [avail, members] = await Promise.all([
        getPracticeGroupAvailPractices(group.id, group.pms_type),
        getPracticeGroupDetails(group.id),
      ]);
      setAvailable(sortByPracticeName(avail));
      setSelected(sortByPracticeName(members));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setAvailable([]);
      setSelected([]);
    } finally {
      setBusy(false);
    }
  }, [group, toast]);

  useEffect(() => {
    if (!open) return;
    void loadLists();
  }, [open, loadLists]);

  const handleAdd = async (practice) => {
    setBusy(true);
    try {
      const result = await addPracticeGroupSite(group.id, practice.id, group.practice_group_name);
      if (result === true) {
        toast.success("Successfully site added to practice group");
        await loadLists();
      } else {
        toast.error("Failed while adding site to practice group");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomModal open={open}  onClose={onClose}  actionText="" cancelText="Close" maxWidth="3xl" 
      title={
        <span>
          {group?.practice_group_name} / <small className="font-normal text-slate-500">Add Group Members</small>
        </span>
      }
     
      
     
    >
      {busy ? <LoaderComponent fullScreen text="Loading..." /> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-center text-sm font-semibold text-slate-800">Available</h3>
          <p className="mb-3 text-center text-xs text-slate-500">
            Click items in the &quot;Available&quot; list to add to the &quot;Selected&quot; list.
          </p>
          <div className="h-72 overflow-y-auto rounded-md border-2 border-slate-800 bg-white p-2">
            {available.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No available items</p>
            ) : (
              available.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy}
                  onClick={() => handleAdd(item)}
                  className="mb-1 w-full rounded border border-slate-300 px-3 py-2 text-center text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                >
                  {item.practice_name}
                </button>
              ))
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-1 text-center text-sm font-semibold text-slate-800">Selected</h3>
          <p className="mb-3 text-center text-xs text-slate-500">
            Go to Remove Sites to remove an item from this list.
          </p>
          <div className="h-72 overflow-y-auto rounded-md border-2 border-slate-800 bg-white p-2">
            {selected.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No selected items</p>
            ) : (
              selected.map((item) => (
                <div
                  key={item.practice_id ?? item.id}
                  className="mb-1 w-full rounded border border-slate-300 px-3 py-2 text-center text-sm text-slate-800"
                >
                  {item.practice_name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
