import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { reportsApi } from "../../client/reports";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ReportDto } from "../../types";

type SortField = "title" | "year" | "date" | "updatedAt";
type SortDirection = "asc" | "desc";

export const ReportList: React.FC = () => {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field)
      return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  const uniqueCategories = useMemo(() => {
    const cats = reports
      .map((r) => r.category || "")
      .filter((c) => c.length > 0);
    return [...new Set(cats)];
  }, [reports]);

  const uniqueYears = useMemo(() => {
    const years = reports
      .map((r) => r.year || "")
      .filter((y) => y.length > 0);
    return [...new Set(years)].sort().reverse();
  }, [reports]);

  const uniqueAuthors = useMemo(() => {
    const authors = reports
      .map((r) => r.updatedBy || "")
      .filter((a) => a.length > 0);
    return [...new Set(authors)];
  }, [reports]);

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.category || "").toLowerCase().includes(q) ||
          r.year.includes(q),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((r) => (r.category || "") === categoryFilter);
    }

    if (yearFilter !== "all") {
      result = result.filter((r) => r.year === yearFilter);
    }

    if (authorFilter !== "all") {
      result = result.filter((r) => (r.updatedBy || "") === authorFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "year") {
        comparison = a.year.localeCompare(b.year);
      } else if (sortField === "date") {
        comparison =
          new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === "updatedAt") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [reports, search, sortField, sortDirection, categoryFilter, yearFilter, authorFilter]);

  const activeFilterCount = [categoryFilter, yearFilter, authorFilter].filter(
    (f) => f !== "all",
  ).length;

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

      {/* Search + Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, or year..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <Filter size={14} />
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}:
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-2 outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-2 outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-2 outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Authors</option>
            {uniqueAuthors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setCategoryFilter("all");
                setYearFilter("all");
                setAuthorFilter("all");
              }}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("title")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Title <SortIcon field="title" />
                  </span>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("year")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Year <SortIcon field="year" />
                  </span>
                </th>
                <th className="px-6 py-4">Category</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("date")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Date <SortIcon field="date" />
                  </span>
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("updatedAt")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Updated <SortIcon field="updatedAt" />
                  </span>
                </th>
                <th className="px-6 py-4">Updated By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={24}
                    />
                    <span className="text-gray-500 text-sm font-medium">
                      Loading reports...
                    </span>
                  </td>
                </tr>
              ) : filteredAndSortedReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 text-sm font-medium"
                  >
                    {search || activeFilterCount > 0
                      ? "No reports match your filters."
                      : "No reports found."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedReports.map((report) => (
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
                      {new Date(report.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(report.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                      {report.updatedBy || "—"}
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
