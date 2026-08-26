import { useRef, useState } from "react";
import CustomModal from "../../components/modal/CustomModal";
import LoaderComponent from "../../components/loader/LoaderComponent";
import { uploadPracticeLogo } from "../../services/practiceManagementService/PracticeManagementServices";
import { getApiErrorMessage } from "../../utils/apiError";
import { convertBase64ToSrc, fileToRawBase64 } from "../../utils/imageSrc";

export default function PracticeLogoModal({ open, practice, onClose, onSaved, toast }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(
    practice?.practice_customer_logo ? convertBase64ToSrc(practice.practice_customer_logo) : "",
  );
  const [logoFile, setLogoFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("Only JPG and PNG images are allowed.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 170 && img.height === 170) {
          setPreview(String(reader.result));
          setLogoFile(file);
        } else {
          toast.error(`Image must be exactly 170×170 pixels. Current size: ${img.width}×${img.height}`);
          event.target.value = "";
          setPreview(practice?.practice_customer_logo ? convertBase64ToSrc(practice.practice_customer_logo) : "");
          setLogoFile(null);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!logoFile) {
      toast.info("Upload resized logo (170 × 170 px) first");
      return;
    }
    setBusy(true);
    try {
      const data = await uploadPracticeLogo(logoFile, practice.id);
      const message = data?.message || "";
      if (message === "Practice logo uploaded successfully") {
        toast.success(message);
        try {
          const userDetails = JSON.parse(sessionStorage.getItem("userDetails") || "{}");
          const loggedPracticeId = userDetails?.roles?.practicerole?.[0]?.practice_id;
          if (String(loggedPracticeId) === String(practice.id)) {
            sessionStorage.setItem("customer_practice_logo", await fileToRawBase64(logoFile));
          }
        } catch {
          /* ignore session write */
        }
        onSaved();
      } else if (message) {
        toast.success(message);
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
      title={`Upload ${practice?.practice_name || ""} Logo`}
      actionText=""
      showCancel
      cancelText="Close"
      maxWidth="md"
    >
      {busy ? <LoaderComponent fullScreen text="Uploading please wait..." /> : null}
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-500">Upload resized logo (170 × 170 px)</p>
        <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-8 hover:bg-slate-50">
          <strong className="block text-slate-800">Click to Select File</strong>
          <small className="text-slate-500">(PNG, JPG supported)</small>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            onChange={handleFile}
          />
        </label>
        <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {preview ? (
            <img src={preview} alt="logo preview" className="h-full w-full object-cover" />
          ) : (
            <p className="text-sm text-slate-400">Preview</p>
          )}
        </div>
        <button
          type="button"
          disabled={!preview}
          onClick={handleUpload}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Upload Logo
        </button>
      </div>
    </CustomModal>
  );
}
