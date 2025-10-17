"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Shield,
  Bell,
} from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const ProfileComponent = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const { currentUser, userProfile, fetchUserProfile } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: userProfile?.name || currentUser?.displayName || "",
      email: currentUser?.email || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      zipCode: userProfile?.zipCode || "",
      bio: userProfile?.bio || "",
    },
  });

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: data.name });
      const userDocRef = doc(db, "users", currentUser.uid);

      await updateDoc(userDocRef, {
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bio: data.bio,
        updatedAt: new Date(),
      });

      await fetchUserProfile(currentUser.uid);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
    toast.success(
      `${type} notifications ${notifications[type] ? "disabled" : "enabled"}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-500">
            Manage your account information and preferences
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Personal Info Card */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <User size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>

            {/* Profile Image */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                  {getInitials(userProfile?.name || currentUser?.displayName)}
                </div>
                <button className="absolute -bottom-1 -right-1 bg-blue-600 border-2 border-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                  <Camera size={14} className="text-white" />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {userProfile?.name || currentUser?.displayName || "User"}
                </h3>
                <p className="text-gray-500">{currentUser?.email}</p>
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                  {userProfile?.role || "buyer"}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Full Name</label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className={`w-full border-2 rounded-lg p-3 mt-1 ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    disabled
                    {...register("email")}
                    className="w-full border-2 rounded-lg p-3 mt-1 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="(555) 123-4567"
                    className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700">Address</label>
                  <input
                    {...register("address")}
                    placeholder="123 Main St"
                    className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-gray-700">City</label>
                  <input
                    {...register("city")}
                    placeholder="San Francisco"
                    className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700">State</label>
                  <input
                    {...register("state")}
                    placeholder="CA"
                    className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200"
                  />
                </div>

                <div>
                  <label className="font-medium text-gray-700">ZIP Code</label>
                  <input
                    {...register("zipCode")}
                    placeholder="94102"
                    className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700">Bio</label>
                <textarea
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  className="w-full border-2 rounded-lg p-3 mt-1 border-gray-200 min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition"
                }`}
              >
                <Save size={20} />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Bell size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Notification Preferences
              </h2>
            </div>

            {["email", "push", "sms"].map((type) => (
              <div
                key={type}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium text-gray-800 capitalize">
                    {type} Notifications
                  </div>
                  <p className="text-gray-500 text-sm">
                    {type === "email"
                      ? "Receive updates about your orders and account"
                      : type === "push"
                      ? "Get real-time notifications in your browser"
                      : "Receive text messages for important updates"}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(type)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    notifications[type] ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                      notifications[type] ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <Shield size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Security & Privacy
              </h2>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="font-medium text-gray-800">
                  Two-Factor Authentication
                </div>
                <p className="text-gray-500 text-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium text-gray-800">
                  Change Password
                </div>
                <p className="text-gray-500 text-sm">
                  Update your account password
                </p>
              </div>
              <button className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
