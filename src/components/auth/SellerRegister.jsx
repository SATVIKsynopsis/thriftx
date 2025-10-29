"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    MapPin,
    Heart,
    Users,
    Loader2,
    Phone,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import { RecaptchaVerifier, signInWithPhoneNumber, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SellerRegister = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        otpCode: "",
        role: "seller",
        location: "",
        favoriteStyles: "",
        sustainabilityGoals: "",
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [useEmail, setUseEmail] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState(null);

    const { signup } = useAuth();
    const router = useRouter();
    const recaptchaVerifierRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleOTPChange = (otp) => {
        setFormData((prev) => ({ ...prev, otpCode: otp }));
        if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: "" }));
    };

    const setupRecaptcha = useCallback(() => {
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
                'size': "invisible",
                'callback': () => { },
                "expired-callback": () => {
                    setErrors({ otpCode: "reCAPTCHA expired. Please try again." });
                    recaptchaVerifierRef.current?.clear();
                    recaptchaVerifierRef.current = null;
                },
            });
            recaptchaVerifierRef.current.render().catch(console.error);
        }
    }, []);

    useEffect(() => {
        setupRecaptcha();
    }, [setupRecaptcha]);

    const validateForm = (step = 1) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = "Name is required";
            if (!formData.password) newErrors.password = "Password is required";
            else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

            if (useEmail) {
                if (!formData.email.trim()) newErrors.email = "Email is required";
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
            } else {
                if (!formData.phoneNumber.trim() || !formData.phoneNumber.startsWith("+")) {
                    newErrors.phoneNumber = "Phone number is required with country code.";
                }
            }
        } else if (step === 2) {
            if (!formData.otpCode.trim() || formData.otpCode.length !== 6) newErrors.otpCode = "6-digit OTP code is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async () => {
        if (!formData.phoneNumber) {
            return;
        }
        try {

            // const usersRef = collection(db, "users");
            // const q = query(usersRef, where("phoneNumber", "==", formData.phoneNumber));
            // const querySnapshot = await getDocs(q);

            // if (!querySnapshot.empty) {
            //     toast.error("This phone number is already registered.");
            //     return;
            // }

            const formattedPhoneNumber = `+${formData.phoneNumber.replace(/\D/g, '')}`;
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifierRef.current);
            setConfirmationResult(confirmation);
            setOtpSent(true);
            toast.success(`OTP sent to ${formData.phoneNumber}`);
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error("Failed to send OTP");
            recaptchaVerifierRef.current = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!otpSent) {
                if (!validateForm(1)) return;

                if (useEmail) {
                    await signup(
                        formData.email,
                        formData.password,
                        {
                            name: formData.name.trim(),
                            email: formData.email,
                            role: "buyer",
                            location: formData.location.trim(),
                            favoriteStyles: formData.favoriteStyles.trim(),
                            sustainabilityGoals: formData.sustainabilityGoals.trim(),
                        }
                    );
                    toast.success("Account created! Please check your email to verify your account.");
                    router.push("/login");
                } else {
                    await handleSendOTP();
                }
            } else {

                if (!validateForm(2)) return;
                // console.log("confirmation result : ", confirmationResult);
                if (!confirmationResult) throw new Error("No OTP confirmation found.");
                try {
                    const result = await confirmationResult.confirm(formData.otpCode);
                    const user = result.user;

                    await updateProfile(user, {
                        displayName: formData.name.trim(),
                    });

                    await setDoc(doc(db, "users", user.uid), {
                        name: formData.name.trim(),
                        phoneNumber: formData.phoneNumber,
                        role: formData.role,
                        location: formData.location.trim(),
                        favoriteStyles: formData.favoriteStyles.trim(),
                        sustainabilityGoals: formData.sustainabilityGoals.trim(),
                        createdAt: new Date().toISOString(),
                    });

                    toast.success("Phone verified successfully! Welcome to ThriftX 🎉");
                    router.push("/");
                } catch (error) {
                    console.log("error while verifying phone number: ", error);
                }
            }
        } catch (error) {
            console.error("Login error:", error);

            const errorMessage =
                error.code === "auth/invalid-credential"
                    ? "Invalid email or password."
                    : error.code === "auth/user-not-found"
                        ? "User not found."
                        : error.code === "auth/wrong-password"
                            ? "Incorrect password."
                            : error.message || "Login failed. Please try again.";

            toast.error(errorMessage);
            if (otpSent && error.code !== "auth/invalid-verification-code") {
                setOtpSent(false);
                setConfirmationResult(null);
            }
        } finally {
            setLoading(false);
        }
    };
    // Google Sign-In
    const handleGoogleSignIn = async () => {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
    
        // If user doesn't exist, create new one
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email,
            role: "seller",
            location: "",
            favoriteStyles: "",
            sustainabilityGoals: "",
            createdAt: new Date().toISOString(),
            provider: "google",
          });
        }
    
        toast.success(`Welcome, ${user.displayName || "Buyer"}! `);
        router.push("/");
      } catch (error) {
        console.error("Google sign-in error:", error);
        toast.error("Google Sign-In failed. Try again.");
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-linear-to-br dark:from-[#0a0a0a] dark:via-[#121212] dark:to-[#1a1a1a] px-4 sm:px-6 py-12 transition-colors">
            <div className="w-full max-w-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black rounded-3xl shadow-xl dark:shadow-[0_0_25px_rgba(255,255,255,0.05)] p-5 sm:p-8 backdrop-blur-md transition-colors">
                {/* HEADER */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {otpSent ? "Verify Phone" : "Join as "}
                        <span className="text-rose-500">Seller</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm font-light">
                        {otpSent ? `Enter the 6-digit code sent to ${formData.phoneNumber}` : "Start selling your thrift treasures ✨"}
                    </p>
                </div>

                {/* Invisible reCAPTCHA */}
                <div id="recaptcha-container" className="absolute w-0 h-0 overflow-hidden"></div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!otpSent && (
                        <>
                            <div className="flex flex-col gap-4">
                                <InputField label="Full Name" name="name" icon={<User size={18} />} value={formData.name} onChange={handleChange} error={errors.name} />
                                <InputField label="Password" name="password" type={showPassword ? "text" : "password"} icon={<Lock size={18} />} value={formData.password} onChange={handleChange} error={errors.password} toggle={showPassword} setToggle={setShowPassword} />
                                <InputField label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} icon={<Lock size={18} />} value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} toggle={showConfirmPassword} setToggle={setShowConfirmPassword} />
                            </div>

                            <div className="flex flex-col gap-4">
                                <InputField label="Store Location (optional)" name="location" icon={<MapPin size={18} />} value={formData.location} onChange={handleChange} />
                                <InputField label="Specialty or Product Type (optional)" name="favoriteStyles" icon={<Heart size={18} />} value={formData.favoriteStyles} onChange={handleChange} />
                            </div>

                            <div className="md:col-span-2">
                                <InputField label="Your Sustainable Goals (optional)" name="sustainabilityGoals" icon={<Users size={18} />} value={formData.sustainabilityGoals} onChange={handleChange} />
                            </div>

                            {/* Email / Phone toggle */}
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Contact Method:</span>
                                    <button type="button" onClick={() => setUseEmail(!useEmail)} className="px-3 py-1 bg-rose-500 text-black rounded-full text-sm font-semibold">
                                        {useEmail ? "Switch to Phone" : "Switch to Email"}
                                    </button>
                                </div>
                                <InputField
                                    label={useEmail ? "Email" : "Phone Number with country code eg (+91)"}
                                    name={useEmail ? "email" : "phoneNumber"}
                                    type={useEmail ? "email" : "text"}
                                    icon={useEmail ? <Mail size={18} /> : <Phone size={18} />}
                                    value={useEmail ? formData.email : formData.phoneNumber}
                                    onChange={handleChange}
                                    error={useEmail ? errors.email : errors.phoneNumber}
                                />
                            </div>
                        </>
                    )}

                    {/* Step 2: OTP Verification */}
                    {otpSent && (
                        <>
                            <div className="flex items-center justify-center">
                                <InputOTP maxLength={6} onChange={handleOTPChange}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                {errors.otpCode && <p className="text-red-500 text-sm mt-1">{errors.otpCode}</p>}
                            </div>
                            <div>
                                <span className="text-lg font-medium pl-15">: Enter your 6 digit OTP</span>
                            </div>
                        </>
                    )}

                    {/* Submit */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-rose-500 text-black font-semibold rounded-full shadow-lg hover:scale-[1.02] hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {loading ? (otpSent ? "Verifying..." : "Creating Account...") : (otpSent ? "Verify Phone & Finish" : "Register as Seller")}
                        </button>
                    </div>
                    {/* OR: Google Sign-In */}
                    <div className="md:col-span-2 flex flex-col items-center gap-3 mt-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">or</p>
                        <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full py-3 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                        >
                            <Image
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                            />
                            <span className="text-gray-700 dark:text-gray-200 font-medium">Continue with Google</span>
                        </button>
                    </div>

                </form>

                {/* FOOTER */}
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
                    <p className="mt-1">
                        Already have an account?{" "}
                        <Link href="/login" className="text-pink-600 dark:text-pink-400 hover:text-blue-500 font-semibold transition-colors hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ---------------- INPUT ----------------
const InputField = ({ label, name, type = "text", icon, value, onChange, error, toggle, setToggle }) => (
    <div className="relative group">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">{label}</label>
        <div className={`relative rounded-full overflow-hidden border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-neutral-900/50 transition-all group-hover:border-rose-500 dark:group-hover:border-rose-400`}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{icon}</div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-purple-500 rounded-full"
            />
            {toggle !== undefined && (
                <button type="button" onClick={() => setToggle(!toggle)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    {toggle ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default SellerRegister;
