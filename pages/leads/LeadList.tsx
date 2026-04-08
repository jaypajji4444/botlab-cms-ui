import {
  Briefcase,
  Calendar,
  Download,
  Eye,
  Globe,
  Mail,
  Phone,
  Search,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { leadsApi } from "../../client/leads";
import { LeadDto } from "../../types";

export const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getAll();
      setLeads(data || []);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await leadsApi.delete(id);
      setLeads(leads.filter((l) => l.id !== id));
      toast.success("Lead deleted");
    } catch (error) {
      toast.error("Could not delete lead");
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const fullName = `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
      const email = (l.email || "").toLowerCase();
      const company = (l.companyName || "").toLowerCase();
      const event = (l.eventLocation || "").toLowerCase();
      const searchTerm = search.toLowerCase();
      return (
        fullName.includes(searchTerm) ||
        email.includes(searchTerm) ||
        company.includes(searchTerm) ||
        event.includes(searchTerm)
      );
    });
  }, [leads, search]);

  const getDisplayName = (lead: LeadDto) => {
    const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
    if (name) return name;
    if (lead.email) return lead.email.split("@")[0];
    return "Anonymous Visitor";
  };

  const getInitials = (lead: LeadDto) => {
    if (lead.firstName && lead.lastName) {
      return (lead.firstName[0] + lead.lastName[0]).toUpperCase();
    }
    if (lead.firstName) return lead.firstName[0].toUpperCase();
    if (lead.lastName) return lead.lastName[0].toUpperCase();
    if (lead.email) return lead.email[0].toUpperCase();
    return "?";
  };

  const handleDownloadCSV = () => {
    const csvEscape = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Event Type",
      "Event Location",
      "Event Date",
      "Message",
      "UTM Data",
      "Page URL",
      "Date",
    ];
    const rows = leads.map((l) =>
      [
        `${l.firstName || ""} ${l.lastName || ""}`.trim(),
        l.email || "",
        l.mobileNumber || "",
        l.companyName || "",
        l.eventType || "",
        l.eventLocation || "",
        l.eventDate || "",
        l.message || "",
        l.utmRaw || "",
        l.pageUrl || "",
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
      ]
        .map(csvEscape)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${leads.length} leads`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">
            Track and manage user inquiries with UTM attribution data.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Event / Company</th>
                <th className="px-6 py-4">UTM Data</th>
                <th className="px-6 py-4">Page</th>
                <th className="px-6 py-4">Received At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase overflow-hidden">
                          {getInitials(lead)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {getDisplayName(lead)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Mail size={12} className="mr-1 opacity-60" />{" "}
                            {lead.email || "No email provided"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Phone size={14} className="mr-1.5 opacity-50" />{" "}
                        {lead.mobileNumber || "N/A"}
                      </div>
                      {lead.message && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                          "{lead.message}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {lead.companyName && (
                          <div className="text-xs text-gray-600 flex items-center">
                            <Briefcase
                              size={12}
                              className="mr-1.5 text-purple-500 flex-shrink-0"
                            />
                            {lead.companyName}
                          </div>
                        )}
                        {lead.eventLocation && (
                          <div className="text-xs text-gray-600 flex items-center">
                            <Sparkles
                              size={12}
                              className="mr-1.5 text-amber-500 flex-shrink-0"
                            />
                            {lead.eventLocation}
                          </div>
                        )}
                        {lead.eventType && (
                          <span className="inline-block text-[10px] font-medium bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">
                            {lead.eventType}
                          </span>
                        )}
                        {lead.eventDate && (
                          <div className="text-[10px] text-gray-400">
                            {lead.eventDate}
                          </div>
                        )}
                        {!lead.companyName &&
                          !lead.eventLocation &&
                          !lead.eventType &&
                          !lead.eventDate && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.utmRaw ? (
                        <div
                          className="text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-100 max-w-[220px] truncate"
                          title={lead.utmRaw}
                        >
                          {lead.utmRaw}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">
                          — Direct —
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.pageUrl ? (
                        <div
                          className="text-xs text-gray-500 flex items-center truncate max-w-[150px]"
                          title={lead.pageUrl}
                        >
                          <Globe size={10} className="mr-1 flex-shrink-0" />
                          {lead.pageUrl.replace(/https?:\/\/[^/]+/, "")}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 opacity-50" />
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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

      {/* Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedLead(null)}
          ></div>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Lead Details</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    First Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedLead.firstName || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Last Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedLead.lastName || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <Mail size={14} className="mr-1.5 text-blue-500" />{" "}
                    {selectedLead.email || "Not provided"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Mobile Number
                  </label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <Phone size={14} className="mr-1.5 text-blue-500" />{" "}
                    {selectedLead.mobileNumber || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Message Content
                </label>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message || "No message provided."}
                </p>
              </div>

              {/* Event & Company Info */}
              {(selectedLead.eventType ||
                selectedLead.eventLocation ||
                selectedLead.companyName ||
                selectedLead.eventDate) && (
                <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 space-y-3">
                  <label className="block text-[10px] font-bold text-violet-500 uppercase tracking-widest">
                    Event / Company
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedLead.companyName && (
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Company
                        </span>
                        <p className="text-sm text-gray-700 font-medium flex items-center mt-0.5">
                          <Briefcase
                            size={13}
                            className="mr-1.5 text-purple-500"
                          />
                          {selectedLead.companyName}
                        </p>
                      </div>
                    )}
                    {selectedLead.eventType && (
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Event Type
                        </span>
                        <p className="text-sm text-gray-700 font-medium mt-0.5">
                          {selectedLead.eventType}
                        </p>
                      </div>
                    )}
                    {selectedLead.eventLocation && (
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Event Location
                        </span>
                        <p className="text-sm text-gray-700 font-medium flex items-center mt-0.5">
                          <Sparkles
                            size={13}
                            className="mr-1.5 text-amber-500"
                          />
                          {selectedLead.eventLocation}
                        </p>
                      </div>
                    )}
                    {selectedLead.eventDate && (
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                          Event Date
                        </span>
                        <p className="text-sm text-gray-700 font-medium flex items-center mt-0.5">
                          <Calendar
                            size={13}
                            className="mr-1.5 text-green-500"
                          />
                          {selectedLead.eventDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UTM & Page Info */}
              {(selectedLead.utmRaw || selectedLead.pageUrl) && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                    Attribution
                  </label>
                  {selectedLead.utmRaw && (
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        UTM Data
                      </span>
                      <p className="text-sm font-mono text-gray-700 break-all bg-white px-3 py-2 rounded border border-blue-100 mt-1">
                        {selectedLead.utmRaw}
                      </p>
                    </div>
                  )}
                  {selectedLead.pageUrl && (
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        Page URL
                      </span>
                      <p className="text-sm font-mono text-blue-600 break-all mt-1">
                        {selectedLead.pageUrl}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                <span className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  Submitted on{" "}
                  {selectedLead.createdAt
                    ? new Date(selectedLead.createdAt).toLocaleString()
                    : "Unknown date"}
                </span>
                <span className="font-mono uppercase">
                  ID: {selectedLead.id.slice(-8)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
