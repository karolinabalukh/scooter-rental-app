import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Фікс іконок
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
    const [scooters, setScooters] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/scooters')
            .then(res => setScooters(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg z-[1001]">
                <div className="p-6 bg-white border-b border-slate-100">
                    <h1 className="text-2xl font-black tracking-tight text-emerald-600 flex items-center gap-2">
                        <span className="text-3xl">🛴</span> SCOOTER<span className="text-slate-400 font-light">GO</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Львів • {scooters.length} активних</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {scooters.map(s => (
                        <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{s.serialNumber}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${s.battery > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                   {s.battery}% 🔋
                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">{s.status === 'AVAILABLE' ? 'Вільний' : 'У дорозі'}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-emerald-200 active:scale-95">
                        Увійти в кабінет
                    </button>
                </div>
            </aside>

            {/* КАРТА */}
            <main className="flex-1 relative">
                <MapContainer center={[49.84, 24.03]} zoom={14} className="h-full w-full">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    {scooters.map(s => (
                        <Marker key={s.id} position={[s.latitude, s.longitude]}>
                            <Popup className="custom-popup">
                                <div className="p-1 text-center font-sans">
                                    <h3 className="font-bold text-slate-800 text-base mb-1">{s.serialNumber}</h3>
                                    <p className="text-xs text-slate-500 mb-3 font-medium">Заряд: {s.battery}%</p>
                                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors w-full">
                                        Орендувати
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </main>
        </div>
    );
}

export default App;