
import { Modal, Button } from "antd";
import { UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userApi } from "../api/userApi";
import { uploadSchema, MAX_UPLOAD_MB, type UploadValues } from "../validation/schemas";
import { serverMessage } from "../validation/serverErrors";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // callback after successful upload
}

export default function UploadModal({ visible, onClose, onSuccess }: UploadModalProps) {
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { file: null },
  });
  const file = watch("file");
  const loading = isSubmitting;

  const pickFile = (f: File | null) => setValue("file", f, { shouldValidate: true });

  const closeModal = () => {
    reset({ file: null });
    onClose();
  };

  const onUpload = async ({ file }: UploadValues) => {
    if (!file) return;
    try {
      await userApi.uploadExcel(file);
      toast.success("Upload successfully");
      onSuccess();
      closeModal();
    } catch (err) {
      toast.error(serverMessage(err, "Upload failed"));
    }
  };

  const downloadSample = () => {
    const sampleData = [
      {
        name: "John Doe",
        email: "john@example.com",
        role: "USER",
        status: "active",
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        role: "ADMIN",
        status: "active",
      },
    ];
    import("xlsx").then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, "sample-users.xlsx");
    });
  };

  return (
    <>
      {loading && (
        <div className="overlay">
          <div className="spinner" />
        </div>
      )}
      <Modal
        className="app-modal"
        title="Import Users"
        open={visible}
        onCancel={closeModal}
        width={640}
        centered
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="upload" type="primary" loading={loading} onClick={handleSubmit(onUpload)}>
            {loading ? "Uploading..." : "Upload"}
          </Button>,
        ]}
      >
        {/* Download Sample */}
        <div className="app-modal-row-between">
          <span className="app-modal-help">Upload an Excel file (.xlsx or .xls) with name, email, role and status columns.</span>
          <Button onClick={downloadSample}>Download sample</Button>
        </div>

        <div
          className={`upload-box ${errors.file ? "error" : ""}`}
          onClick={() => document.getElementById("fileInput")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pickFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <UploadCloud className="upload-icon" size={48} />
          {file ? (
            <p className="file-name">{file.name}</p>
          ) : (
            <p>
              Drag files here or <span className="browse">browse</span>
              <br />
              <small>.xlsx or .xls, up to {MAX_UPLOAD_MB} MB</small>
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              pickFile(e.target.files?.[0] || null);
              e.target.value = ""; // allow re-selecting the same file
            }}
            hidden
          />
        </div>
        {errors.file && <p className="app-modal-error" role="alert">{errors.file.message}</p>}
      </Modal>
    </>
  );
}
