import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import toast, { Toaster } from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";


let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;


function MapController({ selectedScooter }) {
    const map = useMap();
    useEffect(() => {
        if (selectedScooter) {
            map.flyTo([selectedScooter.latitude, selectedScooter.longitude], 17, { animate: true, duration: 1.5 });
        }
    }, [selectedScooter, map]);
    return null;
}

function App() {
    const [scooters, setScooters] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [showLogin, setShowLogin] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [selectedScooter, setSelectedScooter] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [activeRide, setActiveRide] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const fetchScooters = () => {
        axios.get('http://localhost:8080/api/scooters')
            .then(res => setScooters(res.data))
            .catch(err => console.error(err));
    };

    const checkActiveRide = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/rides/history/1`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ongoingRide = response.data.find(r => r.status === 'ONGOING');
            if (ongoingRide) {
                setActiveRide(ongoingRide);
            }
        } catch (error) {
            console.error("Не вдалося перевірити історію поїздок", error);
        }
    };

    useEffect(() => {
        fetchScooters();
        checkActiveRide();
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserEmail(decoded.sub);
            } catch (error) {
                console.error("Недійсний токен", error);
                handleLogout();
            }
        } else {
            setUserEmail('');
        }
    }, [token]);

    // ТАЙМЕР ПОЇЗДКИ
    useEffect(() => {
        let interval;
        if (activeRide) {
            const start = new Date(activeRide.startTime).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                setElapsedTime(Math.floor((now - start) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeRide]);

    const formatTime = (totalSeconds) => {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
        try {
            const response = await axios.post(`http://localhost:8080${endpoint}`, { email, password });

            const receivedToken = response.data.token;
            setToken(receivedToken);
            localStorage.setItem('token', receivedToken);
            const decoded = jwtDecode(receivedToken);
            setUserEmail(decoded.sub);
            setShowLogin(false);
            setIsLoginMode(true);
            setEmail('');
            setPassword('');
            toast.success(isLoginMode ? "Успішний вхід! " : "Реєстрація успішна! ", {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
        } catch (error) {
            toast.error(isLoginMode ? "Неправильна пошта або пароль" : "Помилка авторизації");
        }
    };

    const handleLogout = () => {
        setToken('');
        setUserEmail('');
        localStorage.removeItem('token');
        setActiveRide(null);
        toast.success("Ви вийшли з акаунту");
    };

    const handleRent = async (scooterId) => {
        if (!token) {
            toast.error('Спочатку увійдіть в акаунт!');
            setShowLogin(true);
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8080/api/rides/start?userId=1&scooterId=${scooterId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActiveRide(response.data);
            setSelectedScooter(null);
            toast.success('Поїздка розпочата! ');
            fetchScooters();
        } catch (error) {
            toast.error('Помилка: у вас вже є активна поїздка!');
        }
    };

    const handleEndRide = async () => {
        try {
            const response = await axios.post(`http://localhost:8080/api/rides/${activeRide.id}/end`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const finishedRide = response.data;
            toast.success(`Поїздка завершена! До сплати: ${finishedRide.price.toFixed(2)} ₴ 💳`, {
                duration: 5000,
                icon: '✅'
            });

            setActiveRide(null);
            fetchScooters();
        } catch (error) {
            console.error(error);
            toast.error('Не вдалося завершити поїздку');
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <Toaster position="top-center" />
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
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Львів • {scooters.filter(s => s.status === 'AVAILABLE').length} вільних</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {scooters.map(s => (
                        <div
                            key={s.id}
                            onClick={() => {
                                if(s.status === 'AVAILABLE' && !activeRide) setSelectedScooter(s);
                            }}
                            className={`p-4 bg-white border rounded-2xl transition-all group ${
                                s.status === 'AVAILABLE' && !activeRide
                                    ? 'border-slate-200 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                                    : 'border-slate-100 opacity-60 cursor-not-allowed'
                            } ${selectedScooter?.id === s.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{s.serialNumber}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${s.battery > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {s.battery}% 🔋
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-400">
                                {s.status === 'AVAILABLE' ? 'Вільний • Натисніть для оренди' : 'Вже орендовано'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 🟢 ОНОВЛЕНИЙ БЛОК АВТОРИЗАЦІЇ */}
                <div className="p-4 bg-white border-t border-slate-100">
                    {!token ? (
                        <button onClick={() => { setShowLogin(true); setIsLoginMode(true); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition shadow-md active:scale-95">
                            Увійти в кабінет
                        </button>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-slate-500 mb-3 bg-slate-50 py-2 rounded-xl border border-slate-100 truncate px-2">
                                Кабінет: <strong className="text-emerald-700 block mt-0.5">{userEmail}</strong>
                            </p>
                            <button onClick={handleLogout} className="w-full bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-600 font-bold py-3 rounded-xl transition shadow-sm active:scale-95 text-sm">
                                Вийти з акаунту
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* КАРТА ТА ПАНЕЛІ */}
            <main className="flex-1 relative">
                <MapContainer center={[49.84, 24.03]} zoom={14} className="h-full w-full" zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <MapController selectedScooter={selectedScooter} />

                    {scooters.filter(s => s.status === 'AVAILABLE').map(s => (
                        <Marker
                            key={s.id}
                            position={[s.latitude, s.longitude]}
                            eventHandlers={{
                                click: () => { if (!activeRide) setSelectedScooter(s) }
                            }}
                        />
                    ))}
                </MapContainer>

                {/* ПАНЕЛЬ ОРЕНДИ */}
                {selectedScooter && !activeRide && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2000] w-[400px] bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <button onClick={() => setSelectedScooter(null)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full w-8 h-8 flex items-center justify-center font-bold transition">
                            ×
                        </button>
                        <div className="mb-4">
                            <h2 className="text-xl font-black text-slate-800">Самокат {selectedScooter.serialNumber}</h2>
                            <p className="text-emerald-600 font-bold text-sm flex items-center mt-1">
                                <span className="mr-1">🔋</span> {selectedScooter.battery}% заряду
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-emerald-100 mb-6">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Тариф</p>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">Розблокувати</span>
                                <span className="font-bold text-slate-900">10.00 ₴</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-700">Поїздка</span>
                                <span className="font-bold text-slate-900">3.00 ₴/хв</span>
                            </div>
                        </div>
                        <button onClick={() => handleRent(selectedScooter.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition transform active:scale-95 text-lg">
                            Почати поїздку
                        </button>
                    </div>
                )}

                {/* ПАНЕЛЬ АКТИВНОЇ ПОЇЗДКИ */}
                {activeRide && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[2000] w-[400px] bg-emerald-600 rounded-3xl shadow-2xl p-6 border border-emerald-500 text-white animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Активна поїздка</p>
                                <h2 className="text-2xl font-black">Самокат їде</h2>
                            </div>
                            <div className="bg-emerald-800/40 rounded-xl px-4 py-2 text-2xl font-black font-mono shadow-inner tracking-wider">
                                {formatTime(elapsedTime)}
                            </div>
                        </div>

                        <button
                            onClick={handleEndRide}
                            className="w-full bg-white text-emerald-700 hover:bg-slate-100 font-black py-4 rounded-2xl shadow-xl transition transform active:scale-95 text-lg"
                        >
                            Завершити поїздку
                        </button>
                    </div>
                )}
            </main>

            {/* ВІКНО ЛОГІНУ */}
            {showLogin && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 relative">
                        <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl">×</button>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">{isLoginMode ? 'З поверненням!' : 'Новий акаунт'}</h2>
                        <p className="text-slate-500 text-sm mb-6">{isLoginMode ? 'Введіть свої дані для доступу' : 'Створіть акаунт для оренди самокатів'}</p>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="your@email.com" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Пароль</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none transition" placeholder="••••••••" required />
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl mt-4 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition">
                                {isLoginMode ? 'Увійти' : 'Зареєструватись'}
                            </button>
                        </form>
                        <div className="mt-6 text-center text-sm text-slate-500">
                            {isLoginMode ? 'Немає акаунту? ' : 'Вже є акаунт? '}
                            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-emerald-600 font-bold hover:underline outline-none">
                                {isLoginMode ? 'Зареєструватись' : 'Увійти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;