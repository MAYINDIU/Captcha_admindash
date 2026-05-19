import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaEye } from 'react-icons/fa';
import FastWorkBrand from '../components/FastWorkBrand';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

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
            const response = await fetch('https://fastwork24.com/captcha_backend/public/api/admin/login', {
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

            localStorage.setItem('authToken', data?.data?.token);
            localStorage.setItem('user', JSON.stringify(data?.data?.admin));

            Swal.fire('Success', 'Login successful!', 'success');

            if (data?.data?.admin?.role === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
        }

        setLoading(false);
    };

    const Spinner = () => (
        <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin"></div>
    );

    return (
        <div className="min-h-screen bg-emerald-50 text-emerald-950 font-inter">
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden lg:flex flex-col justify-between bg-emerald-700 px-12 py-10 text-white">
                    <FastWorkBrand light />

                    <div className="max-w-xl">
                        <div className="mb-8 grid grid-cols-3 gap-3">
                            {['24/7', 'KYC', 'Chat'].map((label) => (
                                <div key={label} className="rounded-lg border border-white/25 bg-white/15 px-4 py-3">
                                    <div className="text-xl font-black text-white">{label}</div>
                                    <div className="mt-1 h-1 w-10 rounded-full bg-amber-300"></div>
                                </div>
                            ))}
                        </div>

                        <h1 className="text-4xl font-black leading-tight tracking-normal">
                            FastWork24 operations desk
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50">
                            Secure access for support, user verification, withdrawals, and earning workflow management.
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-lg border border-white/25 bg-white/15 p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100">Response</div>
                                <div className="mt-2 text-2xl font-black">Live</div>
                            </div>
                            <div className="rounded-lg border border-white/25 bg-white/15 p-4">
                                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100">Status</div>
                                <div className="mt-2 text-2xl font-black">Online</div>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs font-semibold text-emerald-100">fastwork24.com</div>
                </section>

                <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
                    <div className="w-full max-w-md rounded-lg border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-8">
                            <FastWorkBrand />
                            <div className="mt-8">
                                <h2 className="text-2xl font-black tracking-normal text-emerald-950">Sign in</h2>
                                <p className="mt-2 text-sm text-emerald-700">Use your FastWork24 admin credentials.</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 w-full rounded-lg border border-emerald-100 bg-emerald-50 px-4 text-emerald-950 outline-none transition placeholder:text-emerald-900/45 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                    placeholder="admin@fastwork24.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 w-full rounded-lg border border-emerald-100 bg-emerald-50 px-4 pr-12 text-sm text-emerald-950 outline-none transition placeholder:text-emerald-900/45 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                        placeholder="Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-emerald-500 transition hover:text-emerald-700"
                                        aria-label={passwordVisible ? "Hide password" : "Show password"}
                                    >
                                        <FaEye />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex h-12 w-full items-center justify-center rounded-lg text-sm font-black uppercase tracking-[0.14em] text-white transition ${
                                    loading
                                        ? "bg-emerald-300 cursor-not-allowed"
                                        : "bg-emerald-800 hover:bg-emerald-700 active:scale-[0.99]"
                                }`}
                            >
                                {loading ? <Spinner /> : "Sign in"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Login;
