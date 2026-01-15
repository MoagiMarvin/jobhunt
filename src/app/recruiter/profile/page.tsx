"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader,
  User,
  BriefcaseBusiness,
  Plus,
  X,
} from "lucide-react";
import RecruiterProfileHeader from "@/components/recruiter/RecruiterProfileHeader";

interface RecruiterProfile {
  id: string;
  company_name: string;
  full_name: string;
  email: string;
  phone?: string;
  company_website?: string;
  job_board_url?: string;
  job_board_type?: string;
  industry?: string;
  specializations?: string[];
  company_size?: string;
  years_in_business?: number;
  linkedin_url?: string;
  verification_status?: string;
}

export default function RecruiterProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [profile, setProfile] = useState<RecruiterProfile>({
    id: "",
    company_name: "",
    full_name: "",
    email: "",
    phone: "",
    company_website: "",
    job_board_url: "",
    job_board_type: "rss",
    industry: "",
    specializations: [],
    company_size: "",
    years_in_business: undefined,
    linkedin_url: "",
    verification_status: "pending",
  });

  const [specializationInput, setSpecializationInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/recruiter/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addSpecialization = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && specializationInput.trim()) {
      e.preventDefault();
      setProfile((prev) => ({
        ...prev,
        specializations: [...(prev.specializations || []), specializationInput],
      }));
      setSpecializationInput("");
    }
  };

  const removeSpecialization = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      specializations: prev.specializations?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/recruiter/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setMessage({ type: "success", text: "Profile saved successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to save profile" });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header (match /profile flow) */}
        <div className="mb-8">
          <RecruiterProfileHeader
            companyName={profile.company_name}
            fullName={profile.full_name}
            email={profile.email}
            phone={profile.phone}
            companyWebsite={profile.company_website}
            linkedinUrl={profile.linkedin_url}
            industry={profile.industry}
            verificationStatus={profile.verification_status}
            isOwner={true}
            onEdit={() => {
              const el = document.getElementById("recruiter-profile-form");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${message.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p
              className={
                message.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Main Form */}
        <form
          id="recruiter-profile-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Basic Information</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Your contact details used for trust + communication
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={profile.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Business</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Helps talent understand your recruiting scope
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Industry
                </label>
                <select
                  name="industry"
                  value={profile.industry || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                >
                  <option value="">Select an industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Company Size
                </label>
                <select
                  name="company_size"
                  value={profile.company_size || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                >
                  <option value="">Select company size</option>
                  <option value="Solo">Solo</option>
                  <option value="Small">Small (2-10)</option>
                  <option value="Medium">Medium (11-50)</option>
                  <option value="Large">Large (50+)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Years in recruiting
                </label>
                <input
                  type="number"
                  name="years_in_business"
                  value={profile.years_in_business || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Company Website
                </label>
                <input
                  type="url"
                  name="company_website"
                  value={profile.company_website || ""}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            {/* Specializations */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Specializations
              </label>
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyDown={addSpecialization}
                placeholder="Type and press Enter (e.g., React Developer)"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.specializations?.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-700 text-sm font-bold shadow-sm flex items-center gap-2 group"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(idx)}
                      className="text-blue-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {(!profile.specializations ||
                  profile.specializations.length === 0) && (
                    <p className="text-slate-400 text-sm italic">
                      No specializations added yet.
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold transition-all shadow-sm"
            >
              {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all border border-slate-200"
            >
              Cancel
            </button>
          </div>

          {/* Small helper row */}
          <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
            <BriefcaseBusiness className="w-4 h-4 text-blue-600" />
            Tip: add 3–5 specializations so talent finds you in search.
          </div>

        </form>
      </div>
    </main>
  );
}
