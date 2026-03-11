import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  Edit2,
  Filter,
  Globe,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { pagesApi } from "../../client/pages";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { PageDto } from "../../types";

type SortField = "title" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export const PageList: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [indexFilter, setIndexFilter] = useState<string>("all");

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await pagesApi.getAll();
      setPages(data);
    } catch (err) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await pagesApi.delete(id);
      setPages(pages.filter((p) => p.id !== id));
      toast.success("Page deleted");
    } catch (error) {
      toast.error("Could not delete page");
    }
  };

  const handleDuplicate = async (page: PageDto) => {
    const toastId = toast.loading("Duplicating page...");
    try {
      const fullPage = await pagesApi.getById(page.id);
      const newPage = await pagesApi.create({
        title: `${fullPage.title} (Copy)`,
        slug: `${fullPage.slug}-copy`,
        sections: fullPage.sections,
        metadata: fullPage.metadata,
        isIndexable: false,
        status: "draft",
      });
      toast.success("Page duplicated!", { id: toastId });
      navigate(`/pages/edit/${newPage.id}`);
    } catch (error) {
      toast.error("Could not duplicate page", { id: toastId });
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

  // Unique authors for filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = pages
      .map((p) => p.updatedBy || "")
      .filter((a) => a.length > 0);
    return [...new Set(authors)];
  }, [pages]);

  const filteredAndSortedPages = useMemo(() => {
    let result = [...pages];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (page) =>
          page.title.toLowerCase().includes(q) ||
          page.slug.toLowerCase().includes(q),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (page) => (page.status || "draft") === statusFilter,
      );
    }

    // Filter by author
    if (authorFilter !== "all") {
      result = result.filter((page) => (page.updatedBy || "") === authorFilter);
    }

    // Filter by indexable
    if (indexFilter !== "all") {
      const isIndexable = indexFilter === "indexed";
      result = result.filter(
        (page) => (page.isIndexable ?? true) === isIndexable,
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "createdAt") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "updatedAt") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    pages,
    searchQuery,
    sortField,
    sortDirection,
    statusFilter,
    authorFilter,
    indexFilter,
  ]);

  const activeFilterCount = [statusFilter, authorFilter, indexFilter].filter(
    (f) => f !== "all",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500">
            Structure your website routes and assign sections.
          </p>
        </div>
        <Link to="/pages/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Page
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by name or slug..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <Filter size={14} />
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-2 outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
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
          <select
            value={indexFilter}
            onChange={(e) => setIndexFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2.5 py-2 outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Index</option>
            <option value="indexed">Indexed</option>
            <option value="noindex">No-Index</option>
          </select>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter("all");
                setAuthorFilter("all");
                setIndexFilter("all");
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
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">
                  #
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("title")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Page Title <SortIcon field="title" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Sections
                </th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Indexable
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Date Created <SortIcon field="createdAt" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("updatedAt")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Last Updated <SortIcon field="updatedAt" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Updated By
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    Loading pages...
                  </td>
                </tr>
              ) : filteredAndSortedPages.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    {searchQuery ||
                      statusFilter !== "all" ||
                      authorFilter !== "all" ||
                      indexFilter !== "all"
                      ? "No pages match your filters."
                      : "No pages found. Create one to get started."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedPages.map((page, index) => (
                  <tr
                    key={page.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/pages/edit/${page.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {page.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-gray-500">
                        <Globe
                          size={13}
                          className="mr-1.5 flex-shrink-0 text-gray-400"
                        />
                        <span className="font-mono text-xs truncate max-w-[200px]">
                          /{page.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          (page.status || "draft") === "published"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {(page.status || "draft") === "published"
                          ? "PUBLISHED"
                          : "DRAFT"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {page.sections?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={page.isIndexable ? "success" : "warning"}
                      >
                        {page.isIndexable ? "YES" : "NO"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(page.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(page.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                      {page.updatedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDuplicate(page)}
                          className="text-gray-400 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
                          title="Duplicate page"
                        >
                          <Copy size={15} />
                        </button>
                        <Link to={`/pages/edit/${page.id}`}>
                          <button className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg">
                            <Edit2 size={15} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={15} />
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
