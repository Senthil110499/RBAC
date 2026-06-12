
import { useState } from "react";
import { Modal, Button } from "antd";
import { UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { userApi } from "../api/userApi";

interface UploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // callback after successful upload
}

export default function UploadModal({ visible, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select an Excel file");

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
      return toast.error("Only .xlsx or .xls files are allowed");
    }

    try {
      setLoading(true);
      await userApi.uploadExcel(file);
      toast.success("Upload successfully");
      onSuccess();
      setFile(null);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
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
        title="Upload File"
        open={visible}
        onCancel={() => {
          onClose();
          setFile(null);
        }}
        footer={null}
        centered
        destroyOnHidden
        closable={false}
      >
        {/* Download Sample */}
        <Button
          onClick={downloadSample}
          block
          style={{ marginBottom: 10, width: 170, marginLeft: 300 }}
          type="primary"
        >
          Download Sample File
        </Button>

        <div
          className="upload-box"
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            borderRadius: 6,
            padding: 24,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <UploadCloud className="upload-icon" size={48} />
          {file ? (
            <p className="file-name">{file.name}</p>
          ) : (
            <p>
              Drag files here or <span className="browse">browse</span>
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            hidden
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, marginTop: 20, }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
