import React, { useState, useEffect } from 'react';
import ImageInput from '../components/ImageInput';
import FaceViewer from '../components/FaceViewer';
import { fetchUsers, compareFace, performInference, identifyUser } from '../services/api';
import { User, CompareResult } from '../types';

const Compare: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [meshObj, setMeshObj] = useState<string | null>(null);
    const [result, setResult] = useState<CompareResult | null>(null);
    const [matchResults, setMatchResults] = useState<any[]>([]);
    const [mode, setMode] = useState<'single' | 'all'>('single');
    const [isLoading, setIsLoading] = useState(false);
    const [meshData, setMeshData] = useState<{ vertices: number[][], faces: number[][], code: number[] } | null>(null);

    useEffect(() => {
        fetchUsers().then(setUsers).catch(console.error);
    }, []);

    const handleImageSelected = async (file: File) => {
        setSelectedFile(file);
        setMeshObj(null);
        setMeshData(null);
        setResult(null);
        setIsLoading(true);
        try {
            const res = await performInference(file);
            if (res.success) {
                setMeshObj(res.mesh_obj);
                setMeshData({ vertices: res.vertices, faces: res.faces, code: res.code });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompare = async () => {
        if (!meshData) return;

        setIsLoading(true);
        setResult(null);
        setMatchResults([]);

        try {
            if (mode === 'single') {
                if (!selectedUser) return;
                const res = await compareFace(parseInt(selectedUser), meshData.vertices, meshData.faces, meshData.code);
                setResult(res);
            } else {
                const matches = await identifyUser(meshData.code);
                setMatchResults(matches);
            }
        } catch (e) {
            console.error(e);
            alert("Comparison failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Compare Faces</h2>
                    <p className="text-slate-400 text-sm">Verify identity by comparing a new image against a registered user's geometric embedding.</p>
                </div>

                <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        <button
                            onClick={() => setMode('single')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'single' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Compare One
                        </button>
                        <button
                            onClick={() => setMode('all')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Match All
                        </button>
                    </div>

                    {mode === 'single' && (
                        <label className="block">
                            <span className="text-slate-300 text-sm font-medium">Select Registered User</span>
                            <select
                                value={selectedUser}
                                onChange={(e) => {
                                    setSelectedUser(e.target.value);
                                    setResult(null);
                                }}
                                className="mt-1 block w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">-- Choose User --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <ImageInput onImageSelected={handleImageSelected} isLoading={isLoading} />

                    <button
                        onClick={handleCompare}
                        disabled={isLoading || !selectedFile || (mode === 'single' && !selectedUser)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold shadow-lg transition-all"
                    >
                        {isLoading ? 'Processing...' : (mode === 'single' ? 'Compare Geometry' : 'Find Matches')}
                    </button>

                    {/* Single Result */}
                    {result && mode === 'single' && (
                        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700 animate-fade-in">
                            <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">Similarity Analysis</h4>

                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium">Cosine Similarity</span>
                                <span className={`text-2xl font-bold ${result.similarity_score > 0.8 ? 'text-green-400' : result.similarity_score > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {(result.similarity_score * 100).toFixed(1)}%
                                </span>
                            </div>

                            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-4">
                                <div
                                    className={`h-2.5 rounded-full ${result.similarity_score > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${Math.max(0, Math.min(100, result.similarity_score * 100))}%` }}
                                ></div>
                            </div>

                            <div className="p-3 bg-slate-900 rounded border border-slate-700 text-sm text-slate-300">
                                {result.similarity_score > 0.8
                                    ? `possible match with ${result.user_name}.`
                                    : `Low confidence. The uploaded face structure differs significantly from ${result.user_name}.`}
                            </div>
                        </div>
                    )}

                    {/* Match All Results */}
                    {matchResults.length > 0 && mode === 'all' && (
                        <div className="mt-6 space-y-3">
                            <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Top Matches</h4>
                            {matchResults.map((match, idx) => (
                                <div key={match.user_id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-700 text-slate-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{match.name}</p>
                                            <p className="text-xs text-slate-500">ID: {match.user_id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold ${match.similarity > 0.8 ? 'text-green-400' : 'text-slate-300'}`}>
                                            {(match.similarity * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-300">Input Mesh Preview</h3>
                <FaceViewer objData={meshObj || undefined} />

                {/* Target Mesh Preview (Side-by-Side) */}
                {mode === 'single' && selectedUser && (
                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4">Target: {users.find(u => u.id.toString() === selectedUser)?.name}</h3>
                        {/* Note: In a real app, we'd fetch the mesh URL from the user object. 
                             Assuming backend serves meshes at /meshes/{filename} and user object has mesh_path 
                         */}
                        <FaceViewer objUrl={`http://localhost:8000/meshes/${users.find(u => u.id.toString() === selectedUser)?.mesh_path.split('/').pop()}`} />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 uppercase font-bold">Input Source</p>
                        <p className="text-white font-medium truncate">{selectedFile?.name || "None"}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 uppercase font-bold">Target Identity</p>
                        <p className="text-white font-medium truncate">
                            {mode === 'single'
                                ? (users.find(u => u.id.toString() === selectedUser)?.name || "None")
                                : "All Users"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compare;