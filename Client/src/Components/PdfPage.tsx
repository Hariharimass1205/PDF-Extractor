import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import SideBar from "./SideBar";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import {
    FaWindowClose,
    FaChevronCircleRight,
    FaChevronCircleLeft,
} from "react-icons/fa";
import axios from "axios";
import Loader from "./Loader";



interface PdfPageProps {
    pdfPath: string;
}

const PdfPage: React.FC<PdfPageProps> = ({ pdfPath }) => {
    const [images, setImages] = useState<string[]>([]);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<string[] | null>(null);
    const [generatedPdfLink, setGeneratedPdfLink] = useState<string | null>(null);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<number>(0);
    const [totalPdfPage, setTotalPdfPage] = useState(0);
    const generatePdf = (selectedPages: string) => {
       axios
            .post(`http://localhost:3000/generatepdf`, {
                selectedPages,
                pdfPath,
            })
            .then((res) => {
                if (res.data) {
                    setGeneratedPdfLink(res.data.generatedDownloadLink);
                    navigate('/');
                }
            });
    };

    const inputChange = (input: string) => {
        const numArr = input.split(",");
        setSelectedPages([]);
        for (const str of numArr) {
            if (str.includes("-")) {
                const arr = str.split("-");
                for (let i = Number(arr[0]); i <= Number(arr[1]); i++) {
                    setSelectedPages((prevSelectedPages) => [...prevSelectedPages, i]);
                }
            } else {
                setSelectedPages((prevSelectedPages) => [
                    ...prevSelectedPages,
                    Number(str),
                ]);
            }
        }
    };

    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleImageSelection = (image: string, index: number) => {
        setSelectedImage((prev) => {
            if (prev?.includes(image)) {
                return prev.filter((img) => img !== image)
            } else {
                return [...(prev || []), image]
            }
        }
        );

        setSelectedPages((prev) =>
            prev.includes(index + 1)
                ? prev.filter((num) => num !== index + 1)
                : [...prev, index + 1]
        );
    };

    useEffect(() => {
        const loadPdf = async () => {
            try {
                console.log(`PDF.js version: ${pdfjsLib.version}`);
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.js`;                console.log(pdfPath)
                console.log(`Worker source: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
                const loadingTask = pdfjsLib.getDocument(pdfPath);
                console.log(loadingTask,"loadingTask")
                const pdfDoc = await loadingTask.promise;
                console.log(pdfDoc,"pdfDoc");
                const numPages = pdfDoc.numPages;
                const pageImages = [];
                const pageWidthsArray = [];
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const totalPages = pdfDoc.numPages;
                    setTotalPdfPage(totalPages);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const width = viewport.width;
                    pageWidthsArray.push(width);
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    if (!context) {
                        console.error("Failed to get 2D context");
                        continue;
                    }
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    const renderTask = page.render(renderContext);
                    await renderTask.promise;
                    const imageDataUrl = canvas.toDataURL("image/png");
                    pageImages.push(imageDataUrl);
                }
                setImages(pageImages);
            } catch (error) {
                console.log(error);
            }
        };

        loadPdf();
    }, [pdfPath]);

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-r from-blue-500 to-green-500">
          {/* Left Section: Image Selection */}
          <div className="w-full lg:w-2/3 p-8 overflow-y-auto bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Select Pages</h1>
            {images && images.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-lg transform transition-all duration-200 hover:scale-105 ${
                      selectedPages.includes(index + 1) ? 'border-4 border-indigo-500' : ''
                    }`}
                    onClick={() => handleImageSelection(image, index)}
                  >
                    <img
                      src={image}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    {selectedPages.includes(index + 1) && (
                      <FaCircleCheck
                        color="indigo"
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md"
                      />
                    )}
                    <p className="absolute bottom-0 left-0 right-0 p-2 text-white text-center font-semibold bg-opacity-60 bg-black">
                      Page {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader />
                <h2 className="text-xl text-white mt-4">Loading Pages...</h2>
              </div>
            )}
          </div>
          {/* Right Section: Preview */}
          <div className="w-full lg:w-1/3 p-8 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">Preview</h2>
            {selectedImage && (
              <div className="w-full flex flex-col items-center">
                {/* Mobile View: Preview Button */}
                <div className="lg:hidden fixed bottom-8 left-8 right-8 z-50">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 transform transition-all duration-300 hover:scale-105"
                  >
                    <GrView className="text-xl" />
                    Preview
                  </button>
                </div>
      
                {/* Desktop View: Image Preview */}
                <div className="relative w-full">
                  {selectedPreviewImage > 0 && (
                    <FaChevronCircleLeft
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 cursor-pointer z-10"
                      size={40}
                      onClick={() => setSelectedPreviewImage((prev) => prev - 1)}
                    />
                  )}
      
                  <img
                    src={selectedImage[selectedPreviewImage]}
                    alt="Image Preview"
                    className="max-h-[60vh] w-full object-contain rounded-lg shadow-lg"
                  />
      
                  {selectedImage.length > 1 && selectedPreviewImage + 1 < selectedImage.length && (
                    <FaChevronCircleRight
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-700 cursor-pointer z-10"
                      size={40}
                      onClick={() => setSelectedPreviewImage((prev) => prev + 1)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
      
          {/* Modal for Image Full Preview */}
          {isModalOpen && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
              >
                <FaWindowClose className="text-red-500" size={40} />
              </button>
              <div className="relative w-full max-w-3xl flex items-center justify-center">
                {selectedPreviewImage > 0 && (
                  <FaChevronCircleLeft
                    className="absolute left-4 hover:cursor-pointer text-white z-110"
                    size={40}
                    onClick={() => setSelectedPreviewImage((prev) => prev - 1)}
                  />
                )}
      
                <img
                  src={selectedImage[selectedPreviewImage]}
                  alt="Full Preview"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                />
      
                {selectedImage.length > 1 && selectedPreviewImage + 1 < selectedImage.length && (
                  <FaChevronCircleRight
                    className="absolute right-4 hover:cursor-pointer text-white z-110"
                    size={40}
                    onClick={() => setSelectedPreviewImage((prev) => prev + 1)}
                  />
                )}
              </div>
            </div>
          )}
      
          {/* Sidebar */}
          <SideBar
            onGeneratePDF={generatePdf}
            onPageSelect={selectedPages}
            downloadLink={generatedPdfLink}
            onInputChange={inputChange}
            totalPages={totalPdfPage}
          />
        </div>
      );
      
};

export default PdfPage;