import React, { useState } from "react";
import axios from "axios";

const FileConverter = () => {
  const [file, setFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("wordToPdf");

  const resetStates = () => {
    setFile(null);
    setFileMetadata(null);
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetStates();
  };

  const validateFile = (fileToValidate) => {
    if (!fileToValidate) return false;
    if (activeTab === "wordToPdf") {
      return fileToValidate.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    return fileToValidate.type === "application/pdf";
  };

  const handleFileChange = async (fileInput) => {
    if (!fileInput) {
      setError("Please select a file.");
      setFile(null);
      return;
    }

    if (!validateFile(fileInput)) {
      setError(
        activeTab === "wordToPdf"
          ? "Please select a valid Word (.docx) file."
          : "Please select a valid PDF file."
      );
      setFile(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
      const response = await axios.post(
        "https://web-app-rp-testing.onrender.com/metadata",
        formData
      );
      setFileMetadata(response.data);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }

    setFile(fileInput);
    setError("");
    setSuccess("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (activeTab === "pdfProtect" && !password) {
      setError("Please enter a password for the PDF.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    if (activeTab === "wordToPdf") {
      formData.append("file", file);
    } else {
      formData.append("pdfFile", file);
      formData.append("password", password);
    }

    try {
      const endpoint =
        activeTab === "wordToPdf"
          ? "https://web-app-rp-testing.onrender.com/convert"
          : "http://localhost:5001/upload";

      const response = await axios.post(endpoint, formData, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
        validateStatus: function (status) {
          return status < 500;
        },
      });

      if (response.status === 400) {
        const errorText = await new Response(response.data).text();
        throw new Error(errorText || "Bad request - please check your input");
      }

      const fileName =
        activeTab === "wordToPdf"
          ? `${file.name.replace(".docx", "")}_converted.pdf`
          : `${file.name.replace(".pdf", "")}_protected.pdf`;

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(
        activeTab === "wordToPdf"
          ? "File successfully converted! Download started."
          : "PDF successfully protected! Download started."
      );
      resetStates();
    } catch (err) {
      console.error("Error details:", err);
      let errorMessage = "An unexpected error occurred.";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = "Invalid request. Please check your file and password.";
        } else if (err.response.status === 413) {
          errorMessage = "File is too large. Please try a smaller file.";
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please try again later.";
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg">
        <header className="bg-indigo-600 text-white text-center py-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">File Converter & Protector</h1>
          <p className="text-sm">Easily convert or protect your files</p>
        </header>
        <nav className="flex">
          <button
            onClick={() => handleTabChange("wordToPdf")}
            className={`flex-grow px-4 py-2 text-sm font-medium ${
              activeTab === "wordToPdf"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Word to PDF
          </button>
          <button
            onClick={() => handleTabChange("pdfProtect")}
            className={`flex-grow px-4 py-2 text-sm font-medium ${
              activeTab === "pdfProtect"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Protect PDF
          </button>
        </nav>
        <main className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drag-and-Drop or File Upload */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 ${
                isDragOver ? "border-indigo-500 bg-indigo-100" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              {file ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Selected File: <strong>{file.name}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={resetStates}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center justify-center text-gray-600 cursor-pointer"
                >
                 <svg 
  xmlns="http://www.w3.org/2000/svg" 
  fill="none" 
  viewBox="0 0 24 24" 
  stroke-width="2" 
  stroke="currentColor" 
  class="w-12 h-12 mb-2"
>
  <path 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    d="M12 16v-8m0 0l-4 4m4-4l4 4M4 20h16"
  />
</svg>

                  <span>
                    Drag & drop your file here or{" "}
                    <span className="text-indigo-500 underline">browse</span>
                  </span>
                  <span className="text-sm text-gray-400 mt-1">
                    {activeTab === "wordToPdf"
                      ? "Only .docx files are allowed."
                      : "Only PDF files are allowed."}
                  </span>
                </label>
              )}
            </div>

            {/* Display Metadata */}
            {fileMetadata && (
              <div className="bg-gray-100 p-4 rounded-md shadow-sm">
                <h3 className="text-gray-700 font-medium mb-2">File Metadata:</h3>
                <pre className="text-sm text-gray-600">
                  {JSON.stringify(fileMetadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Password Input for PDF Protection */}
            {activeTab === "pdfProtect" && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password for PDF
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter a strong password"
                />
              </div>
            )}

            {/* Loading, Error, and Success Messages */}
            {loading && <p className="text-blue-500 text-center">Processing your file...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {activeTab === "wordToPdf" ? "Convert to PDF" : "Protect PDF"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default FileConverter;
