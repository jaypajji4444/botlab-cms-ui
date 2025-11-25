import React, { useEffect, useState } from 'react';
import { sectionsApi } from '../../client/sections';
import { SectionDto } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export const SectionList: React.FC = () => {
  const [sections, setSections] = useState<SectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await sectionsApi.getAll();
      setSections(data);
    } catch (err) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await sectionsApi.delete(id);
      setSections(sections.filter(s => s.id !== id));
      toast.success('Section deleted');
    } catch (error) {
      toast.error('Could not delete section');
    }
  };

  const filteredSections = sections.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sections</h1>
          <p className="text-gray-500">Manage reusable UI blocks and their components.</p>
        </div>
        <Link to="/sections/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Section
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search sections by name or type..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Components</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading sections...</td></tr>
              ) : filteredSections.length === 0 ? (
                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No sections found.</td></tr>
              ) : (
                filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{section.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">{section.slug}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs uppercase font-semibold tracking-wide">
                        {section.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{section.components.length} items</td>
                    <td className="px-6 py-4">
                      <Badge variant={section.isActive ? 'success' : 'neutral'}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/sections/edit/${section.id}`}>
                          <button className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-blue-600">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(section.id)}
                          className="p-2 hover:bg-red-50 rounded text-gray-600 hover:text-red-600"
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
