import { useState } from "react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { addSmartReachPayer } from "../../services/smartReachPayerService/SmartReachPayerServices";
import { getApiErrorMessage, getResponseMessage } from "../../utils/apiError";

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

const ALPHANUMERIC = /^[0-9a-zA-Z]+$/;

export default function SmartReachPayerAddModal({ open, payers, onClose, onSaved, toast }) {
  const [payerName, setPayerName] = useState("");
  const [payerId, setPayerId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputClass = "w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm";

  const nameExists = (payers || []).some((item) => item.name === payerName.trim());
  const idExists = (payers || []).some((item) => String(item.payerId) === String(payerId));

  const handleSave = async (event) => {
    event?.preventDefault();
    setFormError("");
    const name = payerName.trim();
    const idValue = payerId;

    if (!name || !idValue) {
      setSubmitted(true);
      return;
    }
    if (idValue !== "" && idValue < 1) {
      setFormError("payerId is not valid");
      return;
    }
    if (!ALPHANUMERIC.test(idValue)) {
      setFormError("payerId is not valid it should contain either alphabets or numbers");
      return;
    }
    if (nameExists || idExists) {
      setSubmitted(true);
      return;
    }

    setBusy(true);
    try {
      const data = await addSmartReachPayer(name, idValue);
      const message = getResponseMessage(data);
      if (message === "SmartReach payer added successfully") {
        toast.success(message);
        onSaved();
      } else if (message) {
        toast.success(message);
      }
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

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Add Payer"
      actionText="Add Payer"
      onAction={handleSave}
      maxWidth="3xl"
    >
      {busy ? <LoaderComponent fullScreen text="Please wait.." /> : null}
      <form autoComplete="off" noValidate className="space-y-4" onSubmit={handleSave}>
        <Field
          label="SmartReach Payer"
          htmlFor="payerName"
          required
          error={
            submitted && !payerName.trim()
              ? "Payer name is required"
              : nameExists
                ? "Payer name already exists."
                : ""
          }
        >
          <input
            id="payerName"
            name="payerName"
            maxLength={75}
            value={payerName}
            onChange={(event) => setPayerName(event.target.value)}
            placeholder="Payer Name"
            className={inputClass}
            required
          />
        </Field>
        <Field
          label="Payer Id"
          htmlFor="PayerId"
          required
          error={
            submitted && !payerId
              ? "Payer Id is required"
              : idExists
                ? "PayerId already exists."
                : ""
          }
        >
          <input
            id="PayerId"
            name="PayerId"
            value={payerId}
            onChange={(event) => setPayerId(event.target.value)}
            placeholder="PayerId"
            className={inputClass}
            required
          />
        </Field>
        {formError ? <p className="pl-[12.5rem] text-sm font-semibold text-red-600">{formError}</p> : null}
        <button type="submit" tabIndex={-1} style={{ display: "none" }} aria-hidden="true">
          Add Payer
        </button>
      </form>
    </CustomModal>
  );
}
