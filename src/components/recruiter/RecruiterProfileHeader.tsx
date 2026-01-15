import {
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Link as LinkIcon,
  BadgeCheck,
  BadgeAlert,
  Edit2,
} from "lucide-react";

interface RecruiterProfileHeaderProps {
  companyName: string;
  fullName: string;
  email: string;
  phone?: string;
  companyWebsite?: string;
  linkedinUrl?: string;
  industry?: string;
  verificationStatus?: string;
  isOwner?: boolean;
  onEdit?: () => void;
}

function initialsFrom(text: string) {
  const cleaned = (text || "").trim();
  if (!cleaned) return "RC";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export default function RecruiterProfileHeader({
  companyName,
  fullName,
  email,
  phone,
  companyWebsite,
  linkedinUrl,
  industry,
  verificationStatus,
  isOwner = true,
  onEdit,
}: RecruiterProfileHeaderProps) {
  const avatar = initialsFrom(companyName || fullName);
  const status = (verificationStatus || "pending").toLowerCase();
  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: "ok" | "warn" }
  > = {
    verified: {
      label: "Verified",
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "ok",
    },
    pending: {
      label: "Pending verification",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: "warn",
    },
    rejected: {
      label: "Verification issue",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "warn",
    },
  };

  const pill = statusConfig[status] || {
    label: verificationStatus || "Pending verification",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: "warn" as const,
  };

  return (
    <div className="bg-white rounded-xl border-2 border-blue-100 shadow-sm overflow-hidden">
      {/* Background Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Content */}
      <div className="px-8 pb-8 -mt-16 relative">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white shrink-0">
            {avatar}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-2xl font-bold text-primary mb-1">
                  {companyName || "Recruiter Profile"}
                </h1>
                <p className="text-base text-slate-600 font-medium">
                  {industry ? `${industry} • ` : ""}
                  {fullName || "Recruiting contact"}
                </p>
              </div>

              {isOwner && onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all font-semibold text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              {email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  {email}
                </div>
              )}

              {phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  {phone}
                </div>
              )}

              {/* Verification Badge */}
              <div
                className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${pill.bg} ${pill.text} ${pill.border}`}
                title={pill.label}
              >
                {pill.icon === "ok" ? (
                  <BadgeCheck className="w-3 h-3" />
                ) : (
                  <BadgeAlert className="w-3 h-3" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {pill.label}
                </span>
              </div>

              {/* Links */}
              <div className="flex items-center gap-2.5 ml-auto">
                {companyWebsite && (
                  <a
                    href={companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    title="Company website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick meta row */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700">Recruiter account</span>
          <span className="text-slate-300">•</span>
          <span>Keep this up to date so talent can trust your listings.</span>
        </div>
      </div>
    </div>
  );
}

