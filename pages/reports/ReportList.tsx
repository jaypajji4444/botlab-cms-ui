import {
  Edit2,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { reportsApi } from "../../client/reports";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ReportDto } from "../../types";

export const ReportList: React.FC = () => {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getAll();
      setReports(data);
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await reportsApi.delete(id);
      setReports(reports.filter((r) => r.id !== id));
      toast.success("Report deleted");
    } catch (error) {
      toast.error("Could not delete report");
    }
  };

  const filtered = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(search.toLowerCase()) ||
      r.year.includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports Management
          </h1>
          <p className="text-gray-500">
            Upload and organize company reports, annual filings, and documents.
          </p>
        </div>
        <Link to="/reports/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Report
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title, category, or year..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={24}
                    />
                    <span className="text-gray-500 text-sm font-medium">
                      Loading reports...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 text-sm font-medium"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-3">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 truncate max-w-xs">
                            {report.title}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-xs">
                            {report.fileUrl.split("/").pop()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">{report.year}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-600">
                        <Tag size={12} className="mr-1.5 text-blue-400" />
                        {report.category || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(report.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                          title="View PDF"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <Link to={`/reports/edit/${report.id}`}>
                          <button
                            className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
