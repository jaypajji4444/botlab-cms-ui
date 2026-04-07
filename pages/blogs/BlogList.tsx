import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  Filter,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { blogsApi } from "../../client/blogs";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { BlogDto } from "../../types";

type SortField = "title" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [indexFilter, setIndexFilter] = useState<string>("all");

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogsApi.getAll();
      setBlogs(data);
    } catch (err) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    try {
      await blogsApi.delete(id);
      setBlogs(blogs.filter((b) => b.id !== id));
      toast.success("Blog post deleted");
    } catch (error) {
      toast.error("Could not delete blog post");
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
    const cats = blogs.map((b) => b.category || "").filter((c) => c.length > 0);
    return [...new Set(cats)];
  }, [blogs]);

  const uniqueAuthors = useMemo(() => {
    const authors = blogs
      .map((b) => b.updatedBy || "")
      .filter((a) => a.length > 0);
    return [...new Set(authors)];
  }, [blogs]);

  const filteredAndSortedBlogs = useMemo(() => {
    let result = [...blogs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          (b.category || "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((b) => (b.category || "") === categoryFilter);
    }

    if (authorFilter !== "all") {
      result = result.filter((b) => (b.updatedBy || "") === authorFilter);
    }

    if (indexFilter !== "all") {
      const isIndexable = indexFilter === "indexed";
      result = result.filter((b) => (b.isIndexable ?? true) === isIndexable);
    }

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
    blogs,
    search,
    sortField,
    sortDirection,
    statusFilter,
    categoryFilter,
    authorFilter,
    indexFilter,
  ]);

  const activeFilterCount = [
    statusFilter,
    categoryFilter,
    authorFilter,
    indexFilter,
  ].filter((f) => f !== "all").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500">
            Manage your stories, news, and technical articles.
          </p>
        </div>
        <Link to="/blogs/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Write New Blog
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
            placeholder="Search by title, slug, or category..."
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
                setCategoryFilter("all");
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
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Preview</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("title")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Title & Slug <SortIcon field="title" />
                  </span>
                </th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">SEO</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    Created <SortIcon field="createdAt" />
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
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={24}
                    />
                    <span className="text-gray-500 text-sm">
                      Loading blogs...
                    </span>
                  </td>
                </tr>
              ) : filteredAndSortedBlogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-gray-500 text-sm font-medium"
                  >
                    {search || activeFilterCount > 0
                      ? "No blogs match your filters."
                      : "No blog posts found."}
                  </td>
                </tr>
              ) : (
                filteredAndSortedBlogs.map((blog, index) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-12 w-20 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {blog.preview ? (
                          <img
                            src={blog.preview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <Link
                          to={`/blogs/edit/${blog.id}`}
                          className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate block"
                        >
                          {blog.title}
                        </Link>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight truncate italic">
                          /blogs/{blog.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs text-gray-600">
                        <Tag size={12} className="mr-1.5 text-blue-400" />
                        {blog.category || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          blog.status === "published" ? "success" : "neutral"
                        }
                      >
                        {blog.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={blog.isIndexable ? "success" : "warning"}>
                        {blog.isIndexable ? "INDEXABLE" : "NO-INDEX"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(blog.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                      {blog.updatedBy || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`/blogs/edit/${blog.id}`}>
                          <button className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all active:scale-90">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-all active:scale-90"
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
