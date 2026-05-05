import React, { useEffect, useState } from 'react';
import logo from '../images/logo.png';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    // Device ID (optional)
    const [deviceId, setDeviceId] = useState('');

    useEffect(() => {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('deviceId', id);
        }
        setDeviceId(id);
    }, []);

    const togglePasswordVisibility = () => {
        setPasswordVisible(prev => !prev);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            Swal.fire('Error', 'Email and password are required', 'error');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            Swal.fire('Error', 'Password must be at least 8 characters long.', 'error');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://alhamarahomesbd.com/captcha_backend/public/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login: email, password })
            });

            const data = await response.json();

            if (!data.success) {
                Swal.fire('Error', data?.message || 'Login failed', 'error');
                setLoading(false);
                return;
            }

            // Save token & user info
            localStorage.setItem('authToken', data?.data?.token);
            localStorage.setItem('user', JSON.stringify(data?.data?.admin));

            Swal.fire('Success', 'Login successful!', 'success');

            // Redirect admin to dashboard
            if (data?.data?.admin?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/'); // Or another route for regular users
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
        }

        setLoading(false);
    };

    const Spinner = () => (
        <div className="border-4 border-t-4 border-white border-t-transparent rounded-full w-5 h-5 animate-spin"></div>
    );

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 sm:p-12 bg-stone-900 font-inter">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-950 via-stone-900 to-amber-700 opacity-80">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500 opacity-5 blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-red-800 opacity-5 blur-[100px]"></div>
            </div>

            <div className="relative z-20 w-full max-w-lg mx-auto p-8 sm:p-12 bg-black/30 backdrop-blur-3xl rounded-3xl border border-amber-700/50 shadow-2xl shadow-red-950/50 transition-all duration-500 transform hover:scale-[1.02] animate-fade-in">
                <div className="relative z-30 flex flex-col items-center text-center space-y-10">
                    <div className="flex flex-col items-center space-y-3">
                        <img
                            className="w-36 h-36 rounded-full mb-1 shadow-xl border-4 border-amber-600  transform transition-all hover:scale-105"
                            src={logo}
                            alt="Al-Hamra Logo"
                        />
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl font-extrabold tracking-widest text-white uppercase text-center">
                            Captcha Earning System
                        </h2>
                        <p className="text-sm font-light text-amber-500/80">
                            Secure access to your earnings.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-amber-500 mb-2 tracking-wide text-left">
                                EMAIL ADDRESS
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border-b-2 border-red-900/50 rounded-lg text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white/20 focus:border-amber-600"
                                placeholder="user@example.com"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-semibold text-amber-500 mb-2 tracking-wide text-left">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border-b-2 border-red-900/50 rounded-lg text-white pr-10 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:bg-white/20 focus:border-amber-600"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600 hover:text-amber-400 transition"
                                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                                >
                                    <FaEye className="text-amber-500 hover:text-amber-300" />
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center py-3 rounded-xl shadow-2xl font-bold tracking-widest transition-all duration-300 transform mt-8 border-2 border-amber-600 ${
                                loading
                                    ? "bg-red-900/50 cursor-not-allowed text-gray-300"
                                    : "bg-red-900 hover:bg-red-800 active:scale-[0.98] hover:shadow-amber-500/50"
                            } text-white uppercase`}
                        >
                            {loading ? <Spinner /> : "SECURE LOGIN"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
