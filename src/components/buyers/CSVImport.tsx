// components/buyers/CSVImport.tsx
import React, { useState } from "react";
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";
import {
  parseCsvFile,
  validateCsvRows,
  downloadCsvTemplate,
  CsvImportResult,
} from "@/utils/csv";
import { Buyer } from "@/types/buyer";
import { Card } from "../ui/shadcn/card";
import { Button } from "../ui/shadcn/button";

interface CSVImportProps {
  onImport: (buyers: Buyer[]) => Promise<void>;
  onClose: () => void;
  maxRows?: number;
}

export const CSVImport: React.FC<CSVImportProps> = ({
  onImport,
  onClose,
  maxRows = 200,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "validate" | "import">("upload");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("Please select a valid CSV file");
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      const csvData = await parseCsvFile(file);

      if (csvData.length > maxRows) {
        setError(
          `CSV contains ${csvData.length} rows. Maximum allowed is ${maxRows} rows.`
        );
        return;
      }

      const validationResult = validateCsvRows(csvData);
      setResult(validationResult);
      setStep("validate");
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV file");
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!result || result.validRows.length === 0) return;

    try {
      setImporting(true);
      setError(null);

      await onImport(result.validRows);
      setStep("import");
    } catch (err: any) {
      setError(err.message || "Failed to import buyers");
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStep("upload");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Buyers from CSV
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${
                step === "upload" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "upload"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div
              className={`flex items-center ${
                step === "validate" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "validate"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Validate</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div
              className={`flex items-center ${
                step === "import" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "import"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm font-medium">Import</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  variant="ghost"
                  icon={Download}
                  onClick={downloadCsvTemplate}
                  size="sm"
                >
                  Download Template
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                {file ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button onClick={handleValidate} loading={importing}>
                        Validate File
                      </Button>
                      <Button variant="ghost" onClick={resetImport}>
                        Change File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Upload CSV File
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum {maxRows} rows, up to 5MB
                      </p>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button icon={Upload} role="span">
                        Choose CSV File
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Required columns:</strong>
                </p>
                <p>
                  fullName, phone, city, propertyType, purpose, timeline, source
                </p>
                <p>
                  <strong>Optional columns:</strong>
                </p>
                <p>email, bhk, budgetMin, budgetMax, notes, tags, status</p>
              </div>
            </div>
          )}

          {/* Step 2: Validate */}
          {step === "validate" && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Valid Rows</p>
                      <p className="text-2xl font-bold text-green-800">
                        {result.validRows.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="font-medium text-red-800">Error Rows</p>
                      <p className="text-2xl font-bold text-red-800">
                        {result.errors.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Validation Errors
                  </h3>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.errors.map((error, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 font-medium">
                              {error.row}
                            </td>
                            <td className="px-3 py-2">
                              <ul className="list-disc list-inside space-y-1">
                                {error.errors.map((err, i) => (
                                  <li key={i} className="text-red-600">
                                    {err}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={resetImport}>
                  Start Over
                </Button>

                {result.validRows.length > 0 && (
                  <Button onClick={handleImport} loading={importing}>
                    Import {result.validRows.length} Valid Rows
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "import" && result && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Import Successful!
                </h3>
                <p className="text-gray-600 mt-1">
                  Successfully imported {result.validRows.length} buyer records.
                </p>
              </div>

              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
