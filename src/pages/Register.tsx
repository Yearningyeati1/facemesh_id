import React, { useState } from 'react';
import ImageInput from '../components/ImageInput';
import FaceViewer from '../components/FaceViewer';
import { performInference, registerUser } from '../services/api';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [meshObj, setMeshObj] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
    const [meshData, setMeshData] = useState<{ vertices: number[][], faces: number[][], code: number[] } | null>(null);

    const handleImageSelected = async (file: File) => {
        setSelectedFile(file);
        setMeshObj(null);
        setMeshData(null);
        setStatus({ type: null, msg: '' });

        // Auto-preview mesh on selection?
        setIsLoading(true);
        try {
            const result = await performInference(file);
            if (result.success) {
                setMeshObj(result.mesh_obj);
                setMeshData({ vertices: result.vertices, faces: result.faces, code: result.code });
            } else {
                setStatus({ type: 'error', msg: 'Failed to generate mesh.' });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Inference failed. Check backend connection.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name.trim() || !meshData) {
            setStatus({ type: 'error', msg: 'Please provide a name and generate a mesh.' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await registerUser(name, meshData.vertices, meshData.faces, meshData.code);
            if (result.success) {
                setStatus({ type: 'success', msg: `User ${name} registered successfully with ID ${result.user_id}!` });
                setName('');
                setMeshObj(null);
                setMeshData(null);
                setSelectedFile(null);
            } else {
                setStatus({ type: 'error', msg: result.message });
            }
        } catch (e) {
            setStatus({ type: 'error', msg: 'Registration failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-white">New Registration</h2>
                    <p className="text-slate-400 text-sm">Create a new identity record. The system will extract the face, generate a mesh, and store the embedding.</p>
                </div>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-slate-300 text-sm font-medium">Full Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="mt-1 block w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </label>

                    <ImageInput onImageSelected={handleImageSelected} isLoading={isLoading} />

                    {status.msg && (
                        <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' : 'bg-red-900/50 text-red-300 border border-red-800'}`}>
                            {status.msg}
                        </div>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={isLoading || !meshObj || !name}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold shadow-lg transition-all"
                    >
                        {isLoading ? 'Processing...' : 'Save to Database'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-300">Live 3D Preview</h3>
                <FaceViewer objData={meshObj || undefined} />
                <div className="bg-slate-800 p-4 rounded-lg text-xs text-slate-400 border border-slate-700">
                    <p className="font-semibold mb-1">Technical Details</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Vertices and faces extracted via inference API.</li>
                        <li>Preview rendered using Three.js standard material.</li>
                        <li>On save: Mesh converted to .obj, saved to disk, embedding computed via Projection.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Register;