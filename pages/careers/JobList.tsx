import {
  Briefcase,
  Building2,
  Calendar,
  Edit2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { careersApi } from "../../client/careers";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ApplicationDto, JobDto } from "../../types";

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Application Viewer State
  const [viewingApplicationsFor, setViewingApplicationsFor] =
    useState<JobDto | null>(null);
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await careersApi.getAllJobs();
      setJobs(data);
    } catch (err) {
      toast.error("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleViewApplications = async (job: JobDto) => {
    setViewingApplicationsFor(job);
    setLoadingApps(true);
    try {
      const data = await careersApi.getJobApplications(job.id);
      setApplications(data);
    } catch (error) {
      toast.error("Could not fetch applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this job posting and all its applications?"))
      return;
    try {
      await careersApi.deleteJob(id);
      setJobs(jobs.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch (error) {
      toast.error("Could not delete job");
    }
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusVariant = (status: string) => {
    if (status === "published") return "success";
    if (status === "closed") return "error";
    return "neutral";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Openings</h1>
          <p className="text-gray-500">
            Manage recruitment, job postings, and review candidate applications.
          </p>
        </div>
        <Link to="/careers/create">
          <Button>
            <Plus size={18} className="mr-2" />
            New Job Posting
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
              placeholder="Search by role or department..."
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
                <th className="px-6 py-4">Job Details</th>
                <th className="px-6 py-4">Meta</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading jobs...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 text-sm font-medium"
                  >
                    No active jobs found.
                  </td>
                </tr>
              ) : (
                filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-bold text-gray-900 truncate">
                          {job.title}
                        </div>
                        <div className="flex items-center text-[10px] text-gray-400 mt-0.5 space-x-2">
                          <span className="flex items-center">
                            <MapPin size={10} className="mr-1" /> {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center uppercase">
                            <Building2 size={10} className="mr-1" />{" "}
                            {job.department}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-600 flex items-center uppercase">
                          <Briefcase
                            size={10}
                            className="mr-1.5 text-blue-400"
                          />{" "}
                          {job.experience}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center">
                          <Monitor size={10} className="mr-1.5" />{" "}
                          {job.workMode || "Office"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(job.status)}>
                        {job.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewApplications(job)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Users size={14} />
                        </div>
                        <span className="text-xs font-bold">View</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Link to={`/careers/edit/${job.id}`}>
                          <button className="p-2 hover:bg-blue-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-all"
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

      {/* Applications Slide-over/Modal */}
      {viewingApplicationsFor && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewingApplicationsFor(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Users size={20} className="mr-2 text-blue-600" />{" "}
                  Applications: {viewingApplicationsFor.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-tight">
                  {viewingApplicationsFor.id}
                </p>
              </div>
              <button
                onClick={() => setViewingApplicationsFor(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingApps ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2
                    className="animate-spin text-blue-500 mb-2"
                    size={32}
                  />
                  <p className="text-sm text-gray-400">
                    Fetching applicants...
                  </p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Users size={48} className="mx-auto opacity-10 mb-4" />
                  <p className="font-medium">
                    No applications yet for this role.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                            {app.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {app.name}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 space-x-3">
                              <span className="flex items-center">
                                <Mail size={12} className="mr-1" /> {app.email}
                              </span>
                              <span className="flex items-center">
                                <Phone size={12} className="mr-1" />{" "}
                                {app.mobileNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-blue-600 flex items-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                        >
                          <ExternalLink size={14} className="mr-2" /> Resume
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Total Exp
                          </label>
                          <p className="text-xs font-bold text-gray-700">
                            {app.totalExperience}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Relevant Exp
                          </label>
                          <p className="text-xs font-bold text-gray-700">
                            {app.relevantExperience}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Notice Period
                          </label>
                          <p className="text-xs font-bold text-gray-700">
                            {app.noticePeriod}
                          </p>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Location
                          </label>
                          <p className="text-xs font-bold text-gray-700">
                            {app.currentLocation}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            Last Employer
                          </label>
                          <p className="text-xs font-bold text-gray-700 italic">
                            "{app.currentEmployer || "N/A"}"
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" /> Applied on{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-600 font-mono">
                          {app.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
