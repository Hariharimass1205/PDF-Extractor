import { Request, Response } from "express";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";

export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).send("no file uploaded!");
      return;
    }
    const filePath = `${process.env.BACKEND}/uploads/${
      req.file.filename
    }`;
    res.json({ filePath });
  } catch (error) {
    console.error("error while uploading pdf");
  }
};

export const generatePdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { selectedPages, pdfPath } = req.body;
    const fileName = pdfPath.slice(pdfPath.lastIndexOf("/") + 1);
    const filePath = `./uploads/${fileName}`;
    const pdfFile = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfFile);
    const numberOfPages = pdfDoc.getPageCount();
    const selectedPagesArr: number[] = [];
    selectedPages.split(",").forEach((num: string) => {
      if (num.includes("-")) {
        const [start, end] = num.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          selectedPagesArr.push(i-1);
        }
      } else {
        selectedPagesArr.push(Number(num)-1); 
      }
    });    
    
    for (let i = numberOfPages-1; i >= 0; i--) {
      if (!selectedPagesArr.includes(i)) {        
        pdfDoc.removePage(i);
      }
    }

    const pdfBytes = await pdfDoc.save();

    const extractedFileName = `extracted_${Date.now()}_${fileName}`;
    const extractedFilePath = `./uploads/${extractedFileName}`;
    fs.writeFileSync(extractedFilePath, pdfBytes);

    const generatedDownloadLink = `${process.env.BACKEND}/uploads/${extractedFileName}`;
    res.status(200).json({ generatedDownloadLink });
    setTimeout(() => {
      fs.unlinkSync(extractedFilePath);   
    }, 60000);
  } catch (error) {
    console.error("error while generating pdf!");
  }
};