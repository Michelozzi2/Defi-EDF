import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [loading, setLoading] = useState(false);
    // const navigate = useNavigate();

    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/login/', { username, password });
            // Fetch user data to confirm or just redirect
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed", err);
            setError("Identifiants incorrects. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#001A70] flex items-center justify-center">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-[20%] -right-[20%] w-[80vw] h-[80vw] bg-[#FE5815] rounded-full blur-[120px] opacity-30"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 15, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[80vw] bg-[#509E2F] rounded-full blur-[120px] opacity-20"
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <Activity className="w-8 h-8 text-[#001A70]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Defi EDF</h1>
                    <p className="text-blue-100 mt-2">Connectez-vous à votre espace</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Identifiant (NNI)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#FE5815]/50 focus:border-[#FE5815] transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-[#FE5815]/50 focus:border-[#FE5815] transition-all"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm">
                                <Activity size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "w-full bg-[#FE5815] hover:bg-[#ff6a2e] text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group",
                            loading && "opacity-80 cursor-wait"
                        )}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">Mot de passe oublié ?</a>
                </div>
            </motion.div>
        </div>
    );
}
