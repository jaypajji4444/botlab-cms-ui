import React, { useEffect, useState } from 'react';
import { blogsApi } from '../../client/blogs';
import { BlogDto } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Calendar, Eye } from 'lucide-react';
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
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500">Create and manage your articles, news, and stories.</p>
        </div>
        <Link to="/blogs/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Write New Blog
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search blogs by title or slug..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-semibold">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading blogs...</td></tr>
              ) : filteredBlogs.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No blog posts found.</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{blog.title}</div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">/{blog.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={blog.status === 'published' ? 'success' : 'neutral'}>
                        {blog.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 opacity-50" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`/blogs/edit/${blog.id}`}>
                          <button className="p-2 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(blog.id)}
                          className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors" 
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