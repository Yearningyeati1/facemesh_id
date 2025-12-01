import React, { useEffect, useState } from 'react';
import { fetchUsers, deleteUser, updateUser } from '../services/api';
import { User } from '../types';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        fetchUsers().then(setUsers).catch(console.error);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            const success = await deleteUser(id);
            if (success) {
                loadUsers();
            } else {
                alert('Failed to delete user');
            }
        }
    };

    const startEdit = (user: User) => {
        setEditingId(user.id);
        setEditName(user.name);
    };

    const handleUpdate = async () => {
        if (editingId) {
            try {
                await updateUser(editingId, editName);
                setEditingId(null);
                loadUsers();
            } catch (e) {
                alert('Failed to update user');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Registered Users</h2>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-slate-500">#{user.id}</td>
                                <td className="px-6 py-4 font-medium text-white">
                                    {editingId === user.id ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <button onClick={handleUpdate} className="text-green-400 hover:text-green-300">
                                                <i className="fa-solid fa-check"></i>
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        user.name
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => startEdit(user)}
                                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                    No users registered yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserList;
