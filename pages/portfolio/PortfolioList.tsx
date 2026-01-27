import React, { useEffect, useState } from 'react';
import { portfoliosApi } from '../../client/portfolios';
import { PortfolioDto } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Briefcase, MapPin, Tag, Loader2, Inbox } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const data = await portfoliosApi.getAll();
      setPortfolios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) return;
    try {
      await portfoliosApi.delete(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
      toast.success('Portfolio item deleted');
    } catch (error) {
      toast.error('Could not delete portfolio item');
    }
  };

  const filtered = portfolios.filter(p => 
    (p.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Items</h1>
          <p className="text-gray-500">Showcase your projects and success stories.</p>
        </div>
        <Link to="/portfolios/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Project
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search projects by title or category..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Structure</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                        <span className="text-gray-500 font-medium">Loading projects...</span>
                    </td>
                 </tr>
              ) : filtered.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                        <Inbox className="mx-auto text-gray-300 mb-2" size={40} />
                        <p className="text-gray-500 font-medium">{search ? 'No matches found.' : 'No portfolio items yet.'}</p>
                        {!search && (
                            <Link to="/portfolios/create" className="text-blue-600 hover:underline text-sm mt-1 block">Create your first one</Link>
                        )}
                    </td>
                 </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight flex items-center italic">
                            <span className="opacity-50 mr-1">URL:</span> /portfolio/{item.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <div className="text-xs flex items-center text-gray-600">
                             <Tag size={12} className="mr-1.5 text-blue-500" /> {item.category || 'N/A'}
                          </div>
                          <div className="text-xs flex items-center text-gray-600">
                             <MapPin size={12} className="mr-1.5 text-red-400" /> {item.location || 'N/A'}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant="neutral">{(item.sections || []).length} Sections</Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={item.isIndexable ? 'success' : 'warning'}>
                          {item.isIndexable ? 'INDEXABLE' : 'NO-INDEX'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`/portfolios/edit/${item.id}`}>
                          <button className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all active:scale-90">
                            <Edit2 size={16} />
                          </button>
                        </Link>
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