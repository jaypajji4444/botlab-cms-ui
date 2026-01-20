import React, { useEffect, useState } from 'react';
import { contactsApi } from '../../client/contacts';
import { ContactDto } from '../../types';
import { Trash2, Search, Calendar, Phone, Mail, User, Eye, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

export const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactDto | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactsApi.getAll();
      setContacts(data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact entry?')) return;
    try {
      await contactsApi.delete(id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Contact deleted');
    } catch (error) {
      toast.error('Could not delete contact');
    }
  };

  const filteredContacts = contacts.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-gray-500">View and manage inquiries sent through your contact forms.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
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
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Received At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading contacts...</td></tr>
              ) : filteredContacts.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No contact submissions found.</td></tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                         <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                            {contact.firstName[0]}{contact.lastName[0]}
                         </div>
                         <div>
                            <div className="font-semibold text-gray-900">{contact.firstName} {contact.lastName}</div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                               <Mail size={12} className="mr-1 opacity-60" /> {contact.email}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-gray-600 flex items-center">
                          <Phone size={14} className="mr-1.5 opacity-50" /> {contact.mobileNumber}
                       </div>
                       {contact.message && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                             "{contact.message}"
                          </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 opacity-50" />
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors" title="View Message"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(contact.id)}
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
      {selectedContact && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedContact(null)}></div>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <User size={20} />
                     </div>
                     <h3 className="font-bold text-gray-900">Contact Details</h3>
                  </div>
                  <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">First Name</label>
                        <p className="text-gray-900 font-medium">{selectedContact.firstName}</p>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                        <p className="text-gray-900 font-medium">{selectedContact.lastName}</p>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                        <p className="text-gray-900 font-medium flex items-center">
                           <Mail size={14} className="mr-1.5 text-blue-500" /> {selectedContact.email}
                        </p>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                        <p className="text-gray-900 font-medium flex items-center">
                           <Phone size={14} className="mr-1.5 text-blue-500" /> {selectedContact.mobileNumber}
                        </p>
                     </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
                     <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedContact.message || "No message provided."}
                     </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-50">
                     <span className="flex items-center"><Calendar size={12} className="mr-1" /> Submitted on {new Date(selectedContact.createdAt).toLocaleString()}</span>
                     <span className="font-mono uppercase">ID: {selectedContact.id.slice(-8)}</span>
                  </div>
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => setSelectedContact(null)}
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