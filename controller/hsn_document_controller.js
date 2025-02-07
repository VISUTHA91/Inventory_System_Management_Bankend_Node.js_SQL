// controllers/HSNController.js
const HSNModel = require('../model/hsn_document_model');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class HSNController {
    // ✅ Upload and Store Document
    static async uploadDocument(req, res) {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { filename, path } = req.file;

        try {
            // Store file details in the database using the model
            const result = await HSNModel.insertHSNDocument(filename, path);

            // ✅ Extract HSN Code & GST Rate after uploading
            const extractedData = await HSNController.extractHSNFromDocument(path, filename);
            if (extractedData.length > 0) {
                // Store extracted data into `hsn_details` table using the model
                for (let data of extractedData) {
                    await HSNModel.insertHSNDetails(data.hsn_code, data.category, data.gst_rate, result.insertId);
                }
            }

            res.status(201).json({ message: "File uploaded successfully", fileId: result.insertId });
        } catch (err) {
            res.status(500).json({ message: "Error processing file", error: err.message });
        }
    }

    // ✅ Extract HSN Code & GST Rate from Document
    static async extractHSNFromDocument(filePath, fileName) {
        try {
            let extractedText = '';
            const fileType = fileName.split('.').pop();

            if (fileType === 'pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdfParse(dataBuffer);
                extractedText = data.text;
            } else if (fileType === 'docx') {
                const data = await mammoth.extractRawText({ path: filePath });
                extractedText = data.value;
            } else {
                return [];
            }

            return extractHSNDetails(extractedText);
        } catch (error) {
            console.error("Error extracting HSN data:", error);
            return [];
        }
    }

    // ✅ Search HSN & GST Rate by Category
    static async searchHSNByCategory(req, res) {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: "Category name is required" });
        }

        try {
            const result = await HSNModel.searchHSNByCategory(category);
            if (result.length === 0) {
                return res.status(404).json({ message: "Category does not exist in the data" });
            }
            res.status(200).json({ hsn_code: result[0].hsn_code, gst_rate: result[0].gst_rate });
        } catch (err) {
            res.status(500).json({ message: "Database error", error: err.message });
        }
    }
}

// ✅ Function to Extract HSN and GST Details
function extractHSNDetails(text) {
    const hsnRegex = /(\d{4,8})\s+([\w\s]+)\s+([\d.]+)%/g;
    let match;
    const hsnData = [];

    while ((match = hsnRegex.exec(text)) !== null) {
        hsnData.push({
            hsn_code: match[1],
            category: match[2].trim(),
            gst_rate: parseFloat(match[3])
        });
    }
    return hsnData;
}

module.exports = HSNController;
