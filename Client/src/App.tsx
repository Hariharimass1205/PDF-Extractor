import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import PdfPage from "./Components/PdfPage";

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [serverPdfFile, setServerPdfFile] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Valid only PDF!");
        return;
      }
      setPdfFile(file);
    }
  };

  useEffect(() => {
    if (!pdfFile) return;
    const formData = new FormData();
    formData.append("file", pdfFile);
    try {
      axios
        .post(`https://pdf-extractor-1-bozw.onrender.com/uploadpdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          setServerPdfFile(res.data.filePath);
        });
    } catch (error) {
      console.error("Error while uploading PDF", error);
    }
  }, [pdfFile]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
      {!serverPdfFile ? (
        <div className="space-y-6 px-6 py-10 w-full max-w-md text-center bg-white bg-opacity-90 rounded-lg shadow-xl">
          <h1 className="font-extrabold text-3xl sm:text-4xl text-blue-600">
            Online PDF Extraction
          </h1>
          <p className="text-gray-700 text-sm sm:text-lg mt-2">
            Instantly extract the pages you need from your PDF.
          </p>
          <input
            id="fileupload"
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            required
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-base px-6 py-3 rounded-lg mt-4 shadow-md transition-all duration-300 transform hover:scale-105"
            onClick={handleButtonClick}
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col bg-white shadow-lg rounded-lg">
          <PdfPage pdfPath={serverPdfFile} />
        </div>
      )}
    </div>
  );
};

export default App;
