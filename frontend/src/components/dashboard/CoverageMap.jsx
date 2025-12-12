import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import '../../styles/map-cluster.css';
import { useNavigate } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
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

const DEFAULT_CENTER = [42.15, 9.15]; // Corsica centerish

export default function CoverageMap({ stats, onSelect }) {
    const navigate = useNavigate();
    if (!stats) return null;

    const points = stats.map_points || [];

    return (
        <div className="bg-white dark:bg-[#16202A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Répartition ({points.length})</h3>
                <button
                    onClick={() => navigate('/map')}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-edf-blue transition-colors"
                    title="Agrandir la carte"
                >
                    <Maximize2 size={18} />
                </button>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 relative z-0">
                <MapContainer center={DEFAULT_CENTER} zoom={8} style={{ height: '100%', width: '100%' }}>
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

                                        <div className="space-y-1 text-xs text-gray-600 mb-3">
                                            {pt.operateur && <div className="flex justify-between"><span>Opérateur:</span> <span className="font-medium">{pt.operateur}</span></div>}
                                            {pt.carton && <div className="flex justify-between"><span>Carton:</span> <span className="font-medium">{pt.carton}</span></div>}
                                            {pt.date && <div className="flex justify-between"><span>Date:</span> <span className="font-medium">{pt.date}</span></div>}
                                        </div>

                                        {onSelect && (
                                            <button
                                                onClick={() => onSelect(pt)}
                                                className="w-full py-1.5 bg-edf-blue hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
                                            >
                                                Voir fiche complète
                                            </button>
                                        )}
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
