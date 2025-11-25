import React, { useEffect, useState } from 'react';
import { pagesApi } from '../client/pages';
import { sectionsApi } from '../client/sections';
import { Layers, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ pages: 0, sections: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([pagesApi.getAll(), sectionsApi.getAll()])
      .then(([pages, sections]) => {
        setStats({ pages: pages.length, sections: sections.length });
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not connect to the CMS API. Ensure the backend is running and you are logged in.");
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back. Here is what is happening with your content.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Total Pages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pages}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <FileText size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Total Sections</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.sections}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <Layers size={24} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
         </div>
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/pages/create" className="group p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-700">Create New Page</h3>
                    <p className="text-sm text-gray-500 mt-1">Compose a new landing page with existing sections.</p>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600" />
            </Link>
             <Link to="/sections/create" className="group p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-between">
                <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-purple-700">Create New Section</h3>
                    <p className="text-sm text-gray-500 mt-1">Build a reusable component block.</p>
                </div>
                <ArrowRight size={20} className="text-gray-400 group-hover:text-purple-600" />
            </Link>
         </div>
      </div>
    </div>
  );
};
