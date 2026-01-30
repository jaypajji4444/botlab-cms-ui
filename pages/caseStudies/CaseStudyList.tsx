import {
  Calendar,
  Edit2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { caseStudiesApi } from "../../client/caseStudies";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CaseStudyDto } from "../../types";

export const CaseStudyList: React.FC = () => {
  const [caseStudies, setCaseStudies] = useState<CaseStudyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCaseStudies = async () => {
    setLoading(true);
    try {
      const data = await caseStudiesApi.getAllAdmin();
      setCaseStudies(data);
    } catch (err) {
      toast.error("Failed to load case studies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this case study?"))
      return;
    try {
      await caseStudiesApi.delete(id);
      setCaseStudies(caseStudies.filter((c) => c.id !== id));
      toast.success("Case study deleted");
    } catch (error) {
      toast.error("Could not delete case study");
    }
  };

  const filtered = caseStudies.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Studies</h1>
          <p className="text-gray-500">
            Showcase deep project insights and technological milestones.
          </p>
        </div>
        <Link to="/case-studies/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Case Study
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
              placeholder="Search by title or category..."
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
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={24}
                    />
                    <span className="text-gray-500 text-sm font-medium">
                      Loading case studies...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 text-sm font-medium"
                  >
                    No case studies found.
                  </td>
                </tr>
              ) : (
                filtered.map((cs) => (
                  <tr
                    key={cs.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="h-12 w-20 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {cs.preview ? (
                          <img
                            src={cs.preview}
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
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {cs.title}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate italic tracking-tighter">
                          /{cs.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">{cs.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1.5 opacity-50" />
                        {new Date(cs.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cs.isActive ? "success" : "neutral"}>
                        {cs.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <a
                          href={cs.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                          title="View PDF"
                        >
                          <FileText size={16} />
                        </a>
                        <Link to={`/case-studies/edit/${cs.id}`}>
                          <button
                            className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(cs.id)}
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
