"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

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

  const handleSyncJobs = async () => {
    if (!profile.job_board_url) {
      setMessage({
        type: "error",
        text: "Please add a job board URL first",
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/recruiter/sync-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_board_url: profile.job_board_url,
          job_board_type: profile.job_board_type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: "success",
          text: `Synced ${result.count} jobs successfully!`,
        });
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to sync jobs",
        });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-blue-600" />
            Recruiter Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your recruiting business information and connect your job board
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
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

        {/* Verification Status */}
        {profile.verification_status && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Verification Status:</strong>{" "}
              <span className="capitalize text-blue-700 font-semibold">
                {profile.verification_status}
              </span>
            </p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={profile.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  name="industry"
                  value={profile.industry || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <select
                  name="company_size"
                  value={profile.company_size || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select company size</option>
                  <option value="Solo">Solo</option>
                  <option value="Small">Small (2-10)</option>
                  <option value="Medium">Medium (11-50)</option>
                  <option value="Large">Large (50+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years in Recruiting Business
                </label>
                <input
                  type="number"
                  name="years_in_business"
                  value={profile.years_in_business || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Company Website
                </label>
                <input
                  type="url"
                  name="company_website"
                  value={profile.company_website || ""}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={profile.linkedin_url || ""}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Specializations */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specializations
              </label>
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyDown={addSpecialization}
                placeholder="Type and press Enter (e.g., React Developer)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.specializations?.map((spec, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(idx)}
                      className="hover:text-blue-900 font-semibold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Job Board Integration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Job Board Integration
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Connect your job board so candidates on our platform can see and apply for your jobs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Board URL
                </label>
                <input
                  type="url"
                  name="job_board_url"
                  value={profile.job_board_url || ""}
                  onChange={handleInputChange}
                  placeholder="https://jobs.yourcompany.com or RSS feed URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feed Type
                </label>
                <select
                  name="job_board_type"
                  value={profile.job_board_type || "rss"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="json_api">JSON API</option>
                  <option value="xml_sitemap">XML Sitemap</option>
                  <option value="manual">Manual (Upload CSV/JSON)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncJobs}
              disabled={isSaving || !profile.job_board_url}
              className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : null}
              Sync Jobs Now
            </button>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
