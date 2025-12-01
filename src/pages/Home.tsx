import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkBackendHealth } from '../services/api';

const Home: React.FC = () => {
  const [health, setHealth] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setHealth);
  }, []);

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
          3D Face <span className="text-blue-500">Reconstruction</span> & <span className="text-emerald-500">Identity</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Generate high-fidelity 3D meshes from single 2D images. Register identities, calculate embeddings, and perform biometric comparisons using geometric topology.
        </p>
        
        <div className="flex justify-center items-center space-x-4 pt-6">
           <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${health === true ? 'bg-green-900/30 text-green-400 border border-green-500/30' : health === false ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${health === true ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>System Status: {health === null ? 'Checking...' : health ? 'Online' : 'Offline'}</span>
           </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/register" className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-fingerprint text-9xl"></i>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
               <i className="fa-solid fa-user-plus text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Register Identity</h3>
            <p className="text-slate-400 mb-6">Capture a face, generate a normalized 3D mesh, and store the geometric embedding in the vector database.</p>
            <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
              Start Registration <i className="fa-solid fa-arrow-right ml-2"></i>
            </span>
          </div>
        </Link>

        <Link to="/compare" className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-code-compare text-9xl"></i>
          </div>
           <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
               <i className="fa-solid fa-face-viewfinder text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Compare Faces</h3>
            <p className="text-slate-400 mb-6">Upload a new image to generate a temporary mesh and compare its embedding similarity against registered users.</p>
            <span className="text-emerald-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center">
              Analyze Similarity <i className="fa-solid fa-arrow-right ml-2"></i>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;