import React, { useEffect, useState } from 'react';
import { blogsApi } from '../../client/blogs';
import { BlogDto } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Calendar, Tag, Image as ImageIcon, Globe, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogsApi.getAll();
      setBlogs(data);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await blogsApi.delete(id);
      setBlogs(blogs.filter(b => b.id !== id));
      toast.success('Blog post deleted');
    } catch (error) {
      toast.error('Could not delete blog post');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.slug.toLowerCase().includes(search.toLowerCase()) ||
    (b.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500">Manage your stories, news, and technical articles.</p>
        </div>
        <Link to="/blogs/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Write New Blog
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by title, slug, or category..." 
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
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">SEO</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                        <span className="text-gray-500 text-sm">Loading blogs...</span>
                    </td>
                 </tr>
              ) : filteredBlogs.length === 0 ? (
                 <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm font-medium">No blog posts found.</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="h-12 w-20 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                          {blog.preview ? (
                            <img src={blog.preview} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-gray-300" />
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{blog.title}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight truncate italic">/blog/{blog.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center text-xs text-gray-600">
                          <Tag size={12} className="mr-1.5 text-blue-400" />
                          {blog.category || 'Uncategorized'}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={blog.status === 'published' ? 'success' : 'neutral'}>
                        {blog.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={blog.isIndexable ? 'success' : 'warning'}>
                          {blog.isIndexable ? 'INDEXABLE' : 'NO-INDEX'}
                       </Badge>
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