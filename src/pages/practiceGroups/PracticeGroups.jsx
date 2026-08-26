import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useSharedUi } from "patientcare-portal-sharedui/useSharedUi";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { getPracticeGroups } from "../../services/practiceGroupService/PracticeGroupServices";
import { getApiErrorMessage } from "../../utils/apiError";
import PracticeGroupCreateModal from "./PracticeGroupCreateModal";
import PracticeGroupAddSitesModal from "./PracticeGroupAddSitesModal";
import PracticeGroupRemoveSitesModal from "./PracticeGroupRemoveSitesModal";

function sortByGroupName(list) {
  return [...(list || [])].sort((a, b) =>
    String(a?.practice_group_name || "").localeCompare(String(b?.practice_group_name || "")),
  );
}

export default function PracticeGroups() {
  const { toast } = useSharedUi();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [addSitesGroup, setAddSitesGroup] = useState(null);
  const [removeSitesGroup, setRemoveSitesGroup] = useState(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      setGroups(sortByGroupName(await getPracticeGroups()));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async page load
    void loadGroups();
  }, [loadGroups]);

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6">
        <LoaderComponent text="Loading..." />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Practice Groups</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} /> Add Group
        </button>
      </div>

      {!groups.length ? (
        <p className="py-8 text-center text-sm text-slate-600">No Practice Groups</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-b border-slate-100">
                <td className="py-3 text-slate-800">{group.practice_group_name}</td>
                <td className="py-3 text-center">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setAddSitesGroup(group)}
                  >
                    Add Sites
                  </button>
                </td>
                <td className="py-3 text-center">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setRemoveSitesGroup(group)}
                  >
                    Remove Sites
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PracticeGroupCreateModal
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        groups={groups}
        onClose={() => setCreateOpen(false)}
        onSaved={async () => {
          setCreateOpen(false);
          await loadGroups();
        }}
        toast={toast}
      />
      <PracticeGroupAddSitesModal
        key={addSitesGroup?.id || "add-sites-closed"}
        open={Boolean(addSitesGroup)}
        group={addSitesGroup}
        onClose={() => setAddSitesGroup(null)}
        toast={toast}
      />
      <PracticeGroupRemoveSitesModal
        key={removeSitesGroup?.id || "remove-sites-closed"}
        open={Boolean(removeSitesGroup)}
        group={removeSitesGroup}
        onClose={() => setRemoveSitesGroup(null)}
        onChanged={loadGroups}
        toast={toast}
      />
    </div>
  );
}
