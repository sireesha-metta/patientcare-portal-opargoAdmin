import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { TIMEZONES } from "../../config/opargoAdminConfig";
import {addOpargoPractice,getPmsEnv,getPmsTypes,} from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage, getResponseMessage } from "../../utils/apiError";

const emptyForm = {
  pms_type: "",
  practice_timezone: "",
  practice_environment_id: "",
  practice_name: "",
  centricity_endpoint: "",
  centricity_db: "",
  as_api_username: "",
  pms_site_id: "",
  pms_userid: "",
  pms_username: "",
  pms_userpwd: "",
  pms_practice_id: "",
  practice_isDemo: false,
};

const TRIM_FIELDS = [
  "practice_name",
  "centricity_endpoint",
  "centricity_db",
  "as_api_username",
  "pms_site_id",
  "pms_userid",
  "pms_username",
  "pms_userpwd",
  "pms_practice_id",
];

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

function nameAlreadyExists(practices, name) {
  const value = String(name || "").trim().toLowerCase();
  if (!value) return false;
  return (practices || []).some(
    (item) => String(item.practice_name || "").toLowerCase() === value,
  );
}

export default function PracticeAddModal({ open, practices, onClose, onSaved, toast }) {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [pmsTypes, setPmsTypes] = useState([]);
  const [pmsEnv, setPmsEnv] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    getPmsTypes()
      .then(setPmsTypes)
      .catch((error) => toast.error(getApiErrorMessage(error)));
  }, [open, toast]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const type = String(form.pms_type || "");
  const nameExists = nameAlreadyExists(practices, form.practice_name);
  const inputClass = "w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm";

  const requiredMissing = (values) => {
    const currentType = String(values.pms_type || "");
    if (!currentType) return true;
    if (!String(values.practice_timezone).trim() || !String(values.practice_name).trim()) return true;
    if (currentType !== "3" && !String(values.practice_environment_id).trim()) return true;
    if (currentType === "3" && (!String(values.centricity_endpoint).trim() || !String(values.centricity_db).trim())) {
      return true;
    }
    if (currentType === "2" && !String(values.pms_practice_id).trim()) return true;
    if (currentType === "4" && !String(values.as_api_username).trim()) return true;
    if (currentType === "1" && (!String(values.pms_site_id).trim() || !String(values.pms_userid).trim())) return true;
    if (!String(values.pms_username).trim() || !String(values.pms_userpwd).trim()) return true;
    return false;
  };

  const handleTypeChange = async (value) => {
    setField("pms_type", value);
    setField("practice_environment_id", "");
    setPmsEnv([]);
    if (!value) return;
    try {
      setPmsEnv(await getPmsEnv(value));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    const trimmed = { ...form };
    TRIM_FIELDS.forEach((key) => {
      trimmed[key] = String(trimmed[key] || "").trim();
    });
    setForm(trimmed);
    setSubmitted(true);
    if (requiredMissing(trimmed) || nameAlreadyExists(practices, trimmed.practice_name)) {
      toast.error("Please enter all required fields");
      return;
    }
    setBusy(true);
    try {
      const data = await addOpargoPractice(trimmed);
      const message = getResponseMessage(data);
      if (message === "practice added") {
        onSaved();
      } else {
        toast.error(message || "Something went wrong.");
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
      title="Add Practice to Opargo"
      actionText="Add Practice"
      onAction={handleSave}
      maxWidth="4xl"
    >
      {busy ? <LoaderComponent fullScreen text="Loading..." /> : null}
      <form autoComplete="off" noValidate className="space-y-4" onSubmit={handleSave}>
        <Field
          label="Practice Type"
          htmlFor="pms_type"
          required
          error={submitted && !type ? "Practice Type is required" : ""}
        >
          <select
            id="pms_type"
            name="pms_type"
            value={form.pms_type}
            onChange={(event) => handleTypeChange(event.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select</option>
            {pmsTypes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>

        {type === "1" || type === "2" ? (
          <p className="pl-[12.5rem] text-sm text-red-600">
            Note: Athena and Greenway practices should be in configuration file before you create a site. Please contact the Development Team.
          </p>
        ) : null}

        {type ? (
          <>
            <Field
              label="Practice Time Zone"
              htmlFor="practice_timezone"
              required
              error={submitted && !form.practice_timezone ? "Practice Time Zone is required" : ""}
            >
              <select
                id="practice_timezone"
                name="practice_timezone"
                value={form.practice_timezone}
                onChange={(event) => setField("practice_timezone", event.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select</option>
                {TIMEZONES.map((item) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </Field>

            {type !== "3" ? (
              <Field
                label="Practice Environment"
                htmlFor="practice_environment_id"
                required
                error={submitted && !form.practice_environment_id ? "Practice Environment is required" : ""}
              >
                <select
                  id="practice_environment_id"
                  name="practice_environment_id"
                  value={form.practice_environment_id}
                  onChange={(event) => setField("practice_environment_id", event.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Select</option>
                  {pmsEnv.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Field>
            ) : null}

            <Field
              label="Practice Name"
              htmlFor="practice_name"
              required
              error={
                submitted && !String(form.practice_name).trim()
                  ? "Practice Name is required"
                  : nameExists
                    ? "Practice name already exist"
                    : ""
              }
            >
              <input
                id="practice_name"
                name="practice_name"
                value={form.practice_name}
                onChange={(event) => setField("practice_name", event.target.value)}
                placeholder="Practice Name"
                className={inputClass}
                required
              />
            </Field>

            {type === "3" ? (
              <>
                <Field
                  label="Centricity EndPoint"
                  htmlFor="centricity_endpoint"
                  required
                  error={submitted && !form.centricity_endpoint.trim() ? "Centricity EndPoint is required" : ""}
                >
                  <input
                    id="centricity_endpoint"
                    name="centricity_endpoint"
                    value={form.centricity_endpoint}
                    onChange={(event) => setField("centricity_endpoint", event.target.value)}
                    placeholder="Centricity EndPoint"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field
                  label="Centricity Database Name"
                  htmlFor="centricity_db"
                  required
                  error={submitted && !form.centricity_db.trim() ? "Centricity Database Name is required" : ""}
                >
                  <input
                    id="centricity_db"
                    name="centricity_db"
                    value={form.centricity_db}
                    onChange={(event) => setField("centricity_db", event.target.value)}
                    placeholder="Centricity Database Name"
                    className={inputClass}
                    required
                  />
                </Field>
              </>
            ) : null}

            {type === "2" ? (
              <Field
                label="PMS PracticeID"
                htmlFor="pms_practice_id"
                required
                error={submitted && !form.pms_practice_id.trim() ? "PMS PracticeID is required" : ""}
              >
                <input
                  id="pms_practice_id"
                  name="pms_practice_id"
                  value={form.pms_practice_id}
                  onChange={(event) => setField("pms_practice_id", event.target.value)}
                  placeholder="PMS PracticeId"
                  className={inputClass}
                  required
                />
              </Field>
            ) : null}

            {type === "4" ? (
              <Field
                label="API User Name"
                htmlFor="as_api_username"
                required
                error={submitted && !form.as_api_username.trim() ? "API User Name is required" : ""}
              >
                <input
                  id="as_api_username"
                  name="as_api_username"
                  value={form.as_api_username}
                  onChange={(event) => setField("as_api_username", event.target.value)}
                  placeholder="API User Name"
                  className={inputClass}
                  required
                />
              </Field>
            ) : null}

            {type === "1" ? (
              <>
                <Field
                  label="PMS SiteID"
                  htmlFor="pms_site_id"
                  required
                  error={submitted && !form.pms_site_id.trim() ? "PMS SiteID is required" : ""}
                >
                  <input
                    id="pms_site_id"
                    name="pms_site_id"
                    value={form.pms_site_id}
                    onChange={(event) => setField("pms_site_id", event.target.value)}
                    placeholder="PMS SiteID"
                    className={inputClass}
                    required
                  />
                </Field>
                <Field
                  label="PMS UserID"
                  htmlFor="pms_userid"
                  required
                  error={submitted && !form.pms_userid.trim() ? "PMS UserID is required" : ""}
                >
                  <input
                    id="pms_userid"
                    name="pms_userid"
                    value={form.pms_userid}
                    onChange={(event) => setField("pms_userid", event.target.value)}
                    placeholder="PMS UserID"
                    className={inputClass}
                    required
                  />
                </Field>
              </>
            ) : null}

            <Field
              label="PMS User Name"
              htmlFor="pms_username"
              required
              error={submitted && !form.pms_username.trim() ? "PMS User Name is required" : ""}
            >
              <input
                id="pms_username"
                name="pms_username"
                autoComplete="new-username"
                value={form.pms_username}
                onChange={(event) => setField("pms_username", event.target.value)}
                placeholder="PMS User Name"
                className={inputClass}
                required
              />
            </Field>

            <Field
              label="PMS User Password"
              htmlFor="pms_userpwd"
              required
              error={submitted && !form.pms_userpwd.trim() ? "PMS User Password is required" : ""}
            >
              <div className="relative max-w-md">
                <input
                  id="pms_userpwd"
                  name="pms_userpwd"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  value={form.pms_userpwd}
                  onChange={(event) => setField("pms_userpwd", event.target.value)}
                  placeholder="PMS User Password"
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-slate-500"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Demo/Test Practice" htmlFor="practice_isDemo">
              <input
                id="practice_isDemo"
                name="practice_isDemo"
                type="checkbox"
                checked={form.practice_isDemo}
                onChange={(event) => setField("practice_isDemo", event.target.checked)}
                autoComplete="off"
                className="mt-3"
              />
            </Field>
          </>
        ) : null}
        <button type="submit" className="sr-only" tabIndex={-1} style={{ display: "none" }} aria-hidden="true">
          Add Practice
        </button>
      </form>
    </CustomModal>
  );
}
