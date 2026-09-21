import { useEffect, useState } from "react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { addPracticeGroup, getNonPracticeGroupsPractices } from "../../services/practiceGroupService/PracticeGroupServices";
import { getApiErrorMessage } from "../../utils/apiError";

function Field({ label, htmlFor, required, error, children }) {
  return (
    <div className="grid grid-cols-[12.5rem_minmax(0,1fr)] items-start gap-x-4">
      <label htmlFor={htmlFor} className="pt-2 text-right text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      <div>
        {children}
        {error ? <p className="mt-1 text-sm font-semibold text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function groupNameExists(groups, name) {
  const value = String(name || "").trim().toLowerCase();
  if (!value) return false;
  return (groups || []).some(
    (item) => String(item.practice_group_name || "").toLowerCase() === value,
  );
}

export default function PracticeGroupCreateModal({ open, groups, onClose, onSaved, toast }) {
  const [practiceGroupName, setPracticeGroupName] = useState("");
  const [practiceId, setPracticeId] = useState("");
  const [practices, setPractices] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputClass = "w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm";
  const nameExists = groupNameExists(groups, practiceGroupName);

  useEffect(() => {
    if (!open) return;
    getNonPracticeGroupsPractices()
      .then(setPractices)
      .catch((error) => toast.error(getApiErrorMessage(error)));
  }, [open, toast]);

  const handleSave = async (event) => {
    event?.preventDefault();
    const name = practiceGroupName.trim();
    if (groupNameExists(groups, name)) {
      setSubmitted(true);
      return;
    }
    if (!name || !practiceId) {
      setSubmitted(true);
      toast.error("Please enter the practice group details");
      return;
    }
    setBusy(true);
    try {
      const result = await addPracticeGroup(name, practiceId);
      if (result === true) {
        toast.success("Practice group added successfully");
        onSaved();
      } else {
        toast.error("Adding practice group failed");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Add Practice Group"
      actionText="Add Group User"
      onAction={handleSave}
      maxWidth="3xl"
    >
      {busy ? <LoaderComponent fullScreen text="Loading..." /> : null}
      <form autoComplete="off" noValidate className="space-y-4" onSubmit={handleSave}>
        <Field
          label="Practice Group Name"
          htmlFor="practiceGroupName"
          required
          error={
            submitted && !practiceGroupName.trim()
              ? "Practice Group Name is required"
              : nameExists
                ? "Practice Group Name already exist"
                : ""
          }
        >
          <input
            id="practiceGroupName"
            name="practiceGroupName"
            maxLength={75}
            value={practiceGroupName}
            onChange={(event) => setPracticeGroupName(event.target.value)}
            placeholder="Practice Group Name"
            className={inputClass}
            required
          />
        </Field>
        <Field
          label="Initial Group Practice"
          htmlFor="practiceId"
          required
          error={submitted && !practiceId ? "Initial Group Practice is required" : ""}
        >
          <select
            id="practiceId"
            name="practiceId"
            value={practiceId}
            onChange={(event) => setPracticeId(event.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select</option>
            {practices.map((item) => (
              <option key={item.id} value={item.id}>{item.practice_name}</option>
            ))}
          </select>
        </Field>
        <button type="submit" tabIndex={-1} style={{ display: "none" }} aria-hidden="true">
          Add Group User
        </button>
      </form>
    </CustomModal>
  );
}
