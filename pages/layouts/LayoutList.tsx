import {
  CheckCircle,
  Copy,
  Edit2,
  Inbox,
  Layers,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { layoutsApi } from "../../client/layouts";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { LayoutDto, LayoutType } from "../../types";

interface LayoutListProps {
  type: LayoutType;
}

export const LayoutList: React.FC<LayoutListProps> = ({ type }) => {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState<LayoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const label = type === "header" ? "Header" : "Footer";
  const basePath = type === "header" ? "/header" : "/footer";

  const fetchLayouts = async () => {
    setLoading(true);
    try {
      const data = await layoutsApi.getByType(type);
      setLayouts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(`Failed to load ${label.toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, [type]);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${label.toLowerCase()}?`,
      )
    )
      return;
    try {
      await layoutsApi.delete(id);
      setLayouts(layouts.filter((l) => l.id !== id));
      toast.success(`${label} deleted`);
    } catch (error) {
      toast.error(`Could not delete ${label.toLowerCase()}`);
    }
  };

  const handleDuplicate = async (item: LayoutDto) => {
    const toastId = toast.loading(`Duplicating ${label.toLowerCase()}...`);
    try {
      const full = await layoutsApi.getById(item.id);
      const newItem = await layoutsApi.create({
        name: `${full.name} (Copy)`,
        slug: `${full.slug}-copy`,
        type: full.type,
        isActive: false,
        components: full.components,
      });
      toast.success(`${label} duplicated!`, { id: toastId });
      navigate(`${basePath}/edit/${newItem.id}`);
    } catch (error) {
      toast.error(`Could not duplicate ${label.toLowerCase()}`, {
        id: toastId,
      });
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return layouts.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q),
    );
  }, [layouts, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{label} Layouts</h1>
          <p className="text-gray-500">
            Manage your site {label.toLowerCase()} variations.
          </p>
        </div>
        <Link to={`${basePath}/create`}>
          <Button>
            <Plus size={18} className="mr-2" />
            Create {label}
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}s by name or slug...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Components</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={32}
                    />
                    <span className="text-gray-500 font-medium">
                      Loading {label.toLowerCase()}s...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Inbox className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-gray-500 font-medium">
                      {search
                        ? "No matches found."
                        : `No ${label.toLowerCase()}s yet.`}
                    </p>
                    {!search && (
                      <Link
                        to={`${basePath}/create`}
                        className="text-blue-600 hover:underline text-sm mt-1 block"
                      >
                        Create your first {label.toLowerCase()}
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`${basePath}/edit/${item.id}`}
                        className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {item.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">
                        <Layers size={12} className="mr-1" />
                        {(item.components || []).length} Components
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <Badge variant="success">
                          <CheckCircle size={12} className="mr-1" />
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <XCircle size={12} className="mr-1" />
                          INACTIVE
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`${basePath}/edit/${item.id}`}>
                          <button className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all active:scale-90">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="p-2 hover:bg-green-100 rounded-lg text-gray-400 hover:text-green-600 transition-all active:scale-90"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
