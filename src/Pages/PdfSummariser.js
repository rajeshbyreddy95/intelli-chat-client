import React, { useState } from "react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";

const BACKEND = "http://127.0.0.1:5040";

const PdfSummariser = () => {
  const [file, setFile] = useState(null);
  const [summaries, setSummaries] = useState(null);
  const [fileText, setFileText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedPage, setSelectedPage] = useState("All pages");

  // File upload handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummaries(null);
    setFileText(null);
    setAnswer("");
  };

  // Process File
  const handleProcessFile = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    setLoading(true);

    try {
      if (fileExt === "pdf") {
        // Upload to backend for summarization
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post(`${BACKEND}/summarize`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
        });

        if (res.data.summary) {
          setSummaries(res.data.summary);
          setFileText(null);
        } else {
          alert("No summary returned.");
        }
      } else {
        // Client-side CSV/XLSX/TXT processing (simplified)
        const reader = new FileReader();
        reader.onload = (e) => {
          setFileText(e.target.result);
          setSummaries(null);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Error processing file:", err);
      alert("Something went wrong while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  // Ask a question with context
  const handleAsk = async () => {
    if (!question.trim()) {
      alert("Please type a question.");
      return;
    }

    let pageText = "";
    if (summaries) {
      if (selectedPage === "All pages") {
        pageText = Object.values(summaries).join("\n\n");
      } else {
        pageText = summaries[selectedPage];
      }
    } else if (fileText) {
      pageText = fileText;
    }

    try {
      setLoading(true);
      const res = await api.post(
        `${BACKEND}/ask_with_context`,
        { message: question, page_text: pageText },
        { timeout: 60000 }
      );

      setAnswer(res.data.response || "No response.");
    } catch (err) {
      console.error("Error asking question:", err);
      alert("Something went wrong while asking the question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">📂 File Summarize & Q&A</h1>

        {/* File Upload */}
        <input
          type="file"
          accept=".pdf,.csv,.xlsx,.txt"
          onChange={handleFileChange}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleProcessFile}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? "Processing..." : "Summarize / Process File"}
        </button>

        {/* PDF Flow */}
        {summaries && (
          <>
            <div>
              <label className="font-medium">Choose a page:</label>
              <select
                className="border p-2 rounded ml-2"
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
              >
                <option value="All pages">All pages</option>
                {Object.keys(summaries).map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
            </div>

            {Object.keys(summaries).map((page) => (
              <details key={page} className="border rounded p-2">
                <summary className="cursor-pointer">{page}</summary>
                <div className="mt-2">
                  <ReactMarkdown>{summaries[page]}</ReactMarkdown>
                </div>
              </details>
            ))}
          </>
        )}

        {/* CSV/XLSX/TXT Flow */}
        {fileText && (
          <div className="border rounded p-3 bg-gray-50 overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap">{fileText.slice(0, 1000)}...</pre>
          </div>
        )}

        {/* Ask a Question */}
        {(summaries || fileText) && (
          <>
            <input
              type="text"
              placeholder="Enter your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={handleAsk}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Getting answer..." : "Ask"}
            </button>
          </>
        )}

        {/* Answer */}
        {answer && (
          <div className="border rounded p-4 bg-gray-50">
            <h2 className="font-semibold mb-2">Answer:</h2>
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfSummariser;
