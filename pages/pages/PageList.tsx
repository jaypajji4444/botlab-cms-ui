import React, { useEffect, useState } from 'react';
import { pagesApi } from '../../client/pages';
import { PageDto } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export const PageList: React.FC = () => {
  const [pages, setPages] = useState<PageDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await pagesApi.getAll();
      setPages(data);
    } catch (err) {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    try {
      await pagesApi.delete(id);
      setPages(pages.filter(p => p.id !== id));
      toast.success('Page deleted');
    } catch (error) {
      toast.error('Could not delete page');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500">Structure your website routes and assign sections.</p>
        </div>
        <Link to="/pages/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Page
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             <div className="col-span-full py-10 text-center text-gray-500">Loading pages...</div>
        ) : pages.map((page) => (
          <div key={page.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Globe size={14} className="mr-1" />
                    <span className="font-mono">/{page.slug}</span>
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                   {page.sections?.length || 0} Sections
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                 <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Metadata</div>
                 <div className="text-sm text-gray-600 line-clamp-2">
                    {JSON.stringify(page.metadata || {})}
                 </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-100">
               <span className="text-xs text-gray-400">Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
               <div className="flex space-x-2">
                  <Link to={`/pages/edit/${page.id}`}>
                    <button className="text-gray-500 hover:text-blue-600 transition-colors p-1">
                        <Edit2 size={16} />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(page.id)} className="text-gray-500 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={16} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
