import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import '../styles/map-cluster.css';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER = [42.15, 9.15];

export default function MapPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats/')
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0F1720]">
                <RefreshCw className="animate-spin text-edf-blue" size={48} />
            </div>
        );
    }

    const points = stats?.map_points || [];

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-[#0F1720]">
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-[#16202A] border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 z-10 shadow-sm">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Carte du Réseau</h1>
                    <p className="text-sm text-gray-500">{points.length} concentrateurs géolocalisés</p>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative z-0">
                <MapContainer center={DEFAULT_CENTER} zoom={9} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <MarkerClusterGroup chunkedLoading>
                        {points.map((pt) => (
                            <Marker position={[pt.lat, pt.lng]} key={pt.id}>
                                <Popup>
                                    <div className="min-w-[180px]">
                                        <div className="mb-2 border-b border-gray-100 pb-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-gray-400">{pt.n_serie}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pt.etat === 'en_stock' ? 'bg-green-100 text-green-700' :
                                                        pt.etat === 'HS' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {pt.etat.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-sm mt-1">{pt.affectation}</h3>
                                        </div>

                                        <div className="space-y-1 text-xs text-gray-600">
                                            {pt.operateur && <div className="flex justify-between"><span>Opérateur:</span> <span className="font-medium">{pt.operateur}</span></div>}
                                            {pt.carton && <div className="flex justify-between"><span>Carton:</span> <span className="font-medium">{pt.carton}</span></div>}
                                            {pt.date && <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{pt.date}</span></div>}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>
    );
}
