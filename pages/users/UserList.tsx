import {
  Calendar,
  Inbox,
  Loader2,
  Mail,
  Plus,
  Search,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { usersApi } from "../../client/users";
import { Button } from "../../components/ui/Button";
import { UserDto } from "../../types";

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500">Manage CMS user accounts.</p>
        </div>
        <Link to="/users/register">
          <Button>
            <Plus size={18} className="mr-2" />
            Register User
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
              placeholder="Search by name, username or email..."
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
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500 mb-2"
                      size={32}
                    />
                    <span className="text-gray-500 font-medium">
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Inbox
                      className="mx-auto text-gray-300 mb-2"
                      size={40}
                    />
                    <p className="text-gray-500 font-medium">
                      {search ? "No matches found." : "No users yet."}
                    </p>
                    {!search && (
                      <Link
                        to="/users/register"
                        className="text-blue-600 hover:underline text-sm mt-1 block"
                      >
                        Register the first user
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                          {getInitials(user.name)}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 flex items-center">
                        <User size={14} className="mr-1.5 opacity-50" />
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Mail size={14} className="mr-1.5 opacity-50" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 opacity-50" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
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
