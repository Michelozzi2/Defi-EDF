import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Zap, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import clsx from 'clsx';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    // Helper to check if CSRF cookie exists
    const getCsrfCookie = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') return value;
        }
        return null;
    };

    // Ensure CSRF token is set before proceeding
    const ensureCsrf = async () => {
        if (getCsrfCookie()) return true;
        try {
            await api.get('/auth/csrf/');
            // Poll for cookie with retries - resolves race condition
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 50));
                if (getCsrfCookie()) return true;
            }
            return !!getCsrfCookie();
        } catch (e) {
            return false;
        }
    };

    // Fetch CSRF cookie on mount
    useEffect(() => {
        ensureCsrf();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        await ensureCsrf();

        try {
            await api.post('/auth/login/', { username, password });
            navigate('/workspaces');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                await ensureCsrf();
                try {
                    await api.post('/auth/login/', { username, password });
                    navigate('/workspaces');
                    return;
                } catch (retryErr) {
                    console.error("Retry failed", retryErr);
                }
            }
            setError("Identifiants incorrects. Veuillez réessayer.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#001A70] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FE5815] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-pulse-slow delay-1000"></div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-2xl border border-white/5 bg-[#0F1720]/80 backdrop-blur-xl relative z-10">

                {/* Left: Brand Vision */}
                <div className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-gradient-to-br from-[#001A70] to-[#0F1720]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                    <div className="absolute top-0 right-0 p-12 bg-gradient-to-b from-[#FE5815]/20 to-transparent w-full h-full transform skew-x-12 opacity-30 pointer-events-none"></div>

                    <div className="z-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="flex items-center gap-3 mb-12"
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <Zap className="text-[#FE5815] fill-[#FE5815]" size={28} />
                            </div>
                            <span className="text-2xl font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">EDF Inventaire</span>
                        </motion.div>

                        <motion.h2
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl font-bold leading-tight mb-6"
                        >
                            Alimenter <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE5815] to-[#FF8C00]">le Réseau de Demain</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg text-gray-400 max-w-md leading-relaxed"
                        >
                            Gestion nouvelle génération du cycle de vie des concentrateurs CPL. Opérations sécurisées, efficaces et fiables.
                        </motion.p>
                    </div>

                    <div className="z-10 flex items-center gap-4 text-sm text-gray-500 mt-12">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#001A70]"></div>
                            <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-[#001A70]"></div>
                            <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#001A70]"></div>
                        </div>
                        <span>Utilisé par les équipes EDF SEI</span>
                    </div>
                </div>

                {/* Right: Login Form */}
                <div className="p-10 lg:p-20 flex flex-col justify-center h-full bg-[#0F1720]/50 relative">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
                        <Zap className="text-[#FE5815] fill-[#FE5815]" size={32} />
                        <span className="text-2xl font-bold text-white">EDF Inventaire</span>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10">
                            <h3 className="text-3xl font-bold text-white mb-2">Bienvenue</h3>
                            <p className="text-gray-400">Veuillez entrer vos identifiants pour vous connecter.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">NNI / Identifiant</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-500 group-focus-within:text-[#FE5815] transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Numéro d'identification"
                                        className="w-full bg-[#16202A] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FE5815] focus:bg-[#1A2634] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-500 group-focus-within:text-[#FE5815] transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#16202A] border border-gray-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#FE5815] focus:bg-[#1A2634] transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-white transition-colors">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-[#16202A] text-[#FE5815] focus:ring-[#FE5815]" />
                                    Se souvenir de moi
                                </label>
                                <a href="#" className="text-[#FE5815] hover:text-[#ff7b42] font-medium">Mot de passe oublié ?</a>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-3"
                                >
                                    <ShieldCheck size={20} className="shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "w-full bg-gradient-to-r from-[#FE5815] to-[#FF4500] hover:from-[#ff6b2b] hover:to-[#ff5514] text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/40 transition-all flex items-center justify-center gap-3",
                                    loading && "opacity-70 cursor-wait"
                                )}
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Se connecter <ArrowRight size={20} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-xs text-gray-600 font-mono">ACCÈS SÉCURISÉ • SYSTÈME RESTREINT</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
