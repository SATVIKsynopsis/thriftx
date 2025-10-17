"use client";


import React, { useState } from "react";
import  Link from "next/link";
import { useRouter} from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, MapPin, Heart, Users } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const SellerRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        location: '',
        favoriteStyles: '',
        sustainabilityGoals: ''
    }); const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        return Object.keys(newErrors).length === 0 ? true : setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await signup(formData.email, formData.password, {
                name: formData.name.trim(),
                email: formData.email,
                role: 'seller',
                location: formData.location.trim(),
                favoriteStyles: formData.favoriteStyles.trim(),
                sustainabilityGoals: formData.sustainabilityGoals.trim()
            });
            toast.success('Account created successfully!');
            navigate.push('/');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('An account with this email already exists');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email address');
            } else {
                toast.error(`Failed to create account: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Seller Signup</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <InputField label="Full Name" name="name" icon={<User size={20} />} value={formData.name} onChange={handleChange} error={errors.name} />
                    <InputField label="Email" name="email" type="email" icon={<Mail size={20} />} value={formData.email} onChange={handleChange} error={errors.email} />
                    <InputField label="Password" name="password" type={showPassword ? "text" : "password"} icon={<Lock size={20} />} value={formData.password} onChange={handleChange} error={errors.password} toggle={showPassword} setToggle={setShowPassword} />
                    <InputField label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} icon={<Lock size={20} />} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} toggle={showConfirmPassword} setToggle={setShowConfirmPassword} />
                    <InputField label="Location (optional)" name="location" icon={<MapPin size={20} />} value={formData.location} onChange={handleChange} />
                    <InputField label="Favorite Styles (optional)" name="favoriteStyles" icon={<Heart size={20} />} value={formData.favoriteStyles} onChange={handleChange} />
                    <InputField label="Why Choose Sustainable Fashion ? (optional)" name="sustainabilityGoals" icon={<Users size={20} />} value={formData.sustainabilityGoals} onChange={handleChange} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? "Creating Account..." : "Sign Up as Seller"}
                    </button>

                </form>

                <p className="text-center text-sm sm:text-md text-gray-500 mt-4">
                    Want to become a <Link href="/register/customer" className="text-green-600 font-semibold underline">Customer ?</Link><br />
                    Already have an account? <Link href="/login" className="text-indigo-600 font-semibold">Sign in</Link>
                </p>
            </div>
        </div>
    );
};


const InputField = ({ label, name, type, icon, value, onChange, error, toggle, setToggle }) => {
    return (
        <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">{label}</label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {toggle !== undefined && (
                    <button
                        type="button"
                        onClick={() => setToggle(!toggle)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {toggle ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};


export default SellerRegister
