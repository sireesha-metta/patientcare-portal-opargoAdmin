import { useEffect, useState } from "react";
import { Copy, Eye, EyeOff, Lock } from "lucide-react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { renewPracticeApiKeys } from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage } from "../../utils/apiError";

function maskValue(value) {
  if (!value) return "";
  if (value.length <= 4) return "*".repeat(value.length);
  return "*".repeat(value.length - 4) + value.slice(-4);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function renewErrorMessage(error) {
  const status = error?.response?.status;
  if (status === 400) return `Invalid request: ${error.response?.data?.message || "Check your input parameters"}`;
  if (status === 401) return "Unauthorized: Please verify your OpargoAdmin session";
  if (status === 403) return "Forbidden: You do not have permission to renew credentials";
  if (status === 404) return "Endpoint not found. Please verify the API is running.";
  if (status === 503) return "Service unavailable. Backend systems are down. Please try later.";
  return getApiErrorMessage(error, "Failed to renew API keys. Please try again.");
}

function KeyField({ label, hint, value, visible, onToggle, onCopy, copied, copyTone }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          readOnly
          type={visible ? "text" : "password"}
          value={visible ? value || "" : maskValue(value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          title="Toggle visibility"
          className="rounded-md border border-slate-300 px-2 text-slate-600 hover:bg-slate-50"
          onClick={onToggle}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white ${copyTone}`}
        >
          <Copy size={14} /> {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function ApiKeyModal({ open, practice, onClose, toast }) {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState(null);
  const [showClientKey, setShowClientKey] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (!open || !practice) return undefined;
    let cancelled = false;
    renewPracticeApiKeys(practice.id, practice.practice_name)
      .then((data) => {
        if (cancelled) return;
        setApiKeys(data);
        toast.success("API keys renewed successfully!");
      })
      .catch((error) => {
        if (cancelled) return;
        setApiKeys(null);
        toast.error(renewErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, practice, toast]);

  const handleCopy = async (text, fieldName) => {
    if (!text) return;
    try {
      await copyText(text);
      setCopiedField(fieldName);
      toast.info(`${fieldName} copied to clipboard!`);
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <Lock size={18} /> API Keys - {practice?.practice_name || ""}
        </span>
      }
      actionText=""
      cancelText="Close"
      maxWidth="2xl"
    >
      {loading ? (
        <LoaderComponent text="Generating new API keys..." />
      ) : (
        <div className="space-y-4">
          {!apiKeys ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <strong>Error:</strong> Failed to generate API keys. Please check the service status and try again.
            </div>
          ) : null}
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
            <strong>Important:</strong> Copy and save your keys now. You won&apos;t be able to see the secret key again.
          </div>
          <KeyField
            label="Client ID (Public)"
            hint="This is your public identifier. Safe to share."
            value={apiKeys?.clientId}
            visible={showClientKey}
            onToggle={() => setShowClientKey((value) => !value)}
            onCopy={() => handleCopy(apiKeys?.clientId, "Client ID")}
            copied={copiedField === "Client ID"}
            copyTone="bg-blue-600 hover:bg-blue-700"
          />
          <KeyField
            label="Access Key (Private)"
            hint="Keep this secret safe. Never share this access key."
            value={apiKeys?.accessKey}
            visible={showClientSecret}
            onToggle={() => setShowClientSecret((value) => !value)}
            onCopy={() => handleCopy(apiKeys?.accessKey, "Access Key")}
            copied={copiedField === "Access Key"}
            copyTone="bg-red-600 hover:bg-red-700"
          />
          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
            <div>
              <p className="font-semibold text-slate-700">Generated Date</p>
              <p className="mt-1 text-slate-600">
                {apiKeys?.generatedDate ? new Date(apiKeys.generatedDate).toLocaleString() : ""}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Expires In</p>
              <p className="mt-1 text-slate-600">{apiKeys?.expiresIn || "N/A"} days</p>
            </div>
          </div>
        </div>
      )}
    </CustomModal>
  );
}
