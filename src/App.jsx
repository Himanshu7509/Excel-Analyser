import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const ExcelReader = () => {
  const [data, setData] = useState([]); // All data from the Excel file
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [rowsPerPage] = useState(10); // Number of rows to display per page
  const [selectedFile, setSelectedFile] = useState("data.xlsx"); // Selected file from dropdown
  const [fileList, setFileList] = useState(["Execution-Dates.xlsx","Financial_Sample.xlsx","Employees-Table.xlsx","Budget_vs_Actual.xlsx"]); // List of available Excel files

  // Fetch data from the selected Excel file
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/${selectedFile}`); // Fetch the selected file
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setData(jsonData);
      } catch (error) {
        console.error("Error loading Excel file:", error);
      }
    };

    fetchData();
  }, [selectedFile]);

  // Filter data based on the search query
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Calculate pagination variables
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
        Excel Data Viewer
      </h1>
      <div className="flex justify-center mb-6">
        {/* Dropdown for file selection */}
        <select
          value={selectedFile}
          onChange={(e) => {
            setSelectedFile(e.target.value);
            setCurrentPage(1); // Reset to the first page when file changes
          }}
          className="border border-gray-300 rounded-lg p-2 mr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {fileList.map((file, index) => (
            <option key={index} value={file}>
              {file}
            </option>
          ))}
        </select>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to the first page on search
          }}
          className="border border-gray-300 rounded-lg p-2 w-1/2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-blue-500 text-white">
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="py-2 px-4 border border-gray-200 text-left">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-100`}
              >
                {Object.values(row).map((value, idx) => (
                  <td
                    key={idx}
                    className="py-2 px-4 border border-gray-200 text-gray-700"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`${
            currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500"
          } text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600`}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500"
          } text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExcelReader;