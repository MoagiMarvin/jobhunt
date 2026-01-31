import { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, MapPin, Briefcase, Car, CreditCard, Github, Linkedin, Globe, FileText, Sparkles, Edit2 } from "lucide-react";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData: {
        name: string;
        headline: string;
        email: string;
        phone: string;
        location: string;
        availabilityStatus: "Looking for Work" | "Not Looking" | "Open to Offers" | "Unavailable";
        haveLicense?: boolean;
        licenseCode?: string;
        haveCar?: boolean;
        github?: string;
        linkedin?: string;
        portfolio?: string;
        targetRoles?: string[];
        avatar?: string;
    };
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [formData, setFormData] = useState(initialData);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

    const handleClose = () => {
        if (hasChanges) {
            if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] sm:max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Grab Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">Edit Professional Profile</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Wrapper */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center justify-center py-6 bg-slate-50 border-b border-slate-100">
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="avatar-upload"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setIsUploading(true);
                                            try {
                                                // 1. Show preview immediately
                                                const previewUrl = URL.createObjectURL(file);
                                                setFormData(prev => ({ ...prev, avatar: previewUrl })); // Optimistic update

                                                // 2. Upload to Supabase
                                                const { data: { session } } = await import("@/lib/supabase").then(m => m.supabase.auth.getSession());
                                                if (session) {
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${session.user.id}/avatar_${Date.now()}.${fileExt}`;

                                                    // Upload
                                                    const { error: uploadError } = await import("@/lib/supabase").then(m => m.supabase.storage
                                                        .from('avatars')
                                                        .upload(fileName, file, { upsert: true }));

                                                    if (uploadError) throw uploadError;

                                                    // Get Public URL
                                                    const { data: { publicUrl } } = await import("@/lib/supabase").then(m => m.supabase.storage
                                                        .from('avatars')
                                                        .getPublicUrl(fileName));

                                                    // Update form data with real URL
                                                    setFormData(prev => ({ ...prev, avatar: publicUrl }));
                                                }
                                            } catch (error) {
                                                console.error("Error uploading avatar:", error);
                                                alert("Failed to upload profile picture. Please try again.");
                                                // Reset to previous avatar on error
                                                setFormData(prev => ({ ...prev, avatar: initialData.avatar }));
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }
                                    }}
                                />
                                <label htmlFor="avatar-upload" className="block cursor-pointer">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200 relative group-hover:border-blue-200 transition-all">
                                        {(formData as any).avatar ? (
                                            <img src={(formData as any).avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-500">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm group-hover:bg-blue-700 transition-colors">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </div>
                                </label>
                            </div>
                            <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tap to Change Photo</p>
                        </div>

                        <div className="p-5 md:p-8 grid md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                />
                            </div>

                            {/* Headline */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    Professional Headline
                                </label>
                                <input
                                    type="text"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                    placeholder="e.g. Computer Science Student | UI/UX Enthusiast"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                />
                            </div>


                            {/* Contact Info */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                />
                            </div>

                            {/* Availability */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    Availability Status
                                </label>
                                <select
                                    value={formData.availabilityStatus}
                                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white font-medium capitalize text-sm"
                                >
                                    <option value="Looking for Work">Looking for Work</option>
                                    <option value="Not Looking">Not Looking</option>
                                    <option value="Open to Offers">Open to Offers</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                            </div>

                            {/* Social Links Section Header */}
                            <div className="col-span-2 pt-4 border-t border-slate-100 mt-2">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Social Media & Portfolio</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase">
                                            <Github className="w-3.5 h-3.5" />
                                            GitHub
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.github || ""}
                                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase">
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.linkedin || ""}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/in/..."
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase">
                                            <Globe className="w-3.5 h-3.5" />
                                            Portfolio / Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.portfolio || ""}
                                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                            </div>


                            {/* Career Intent Section */}
                            <div className="col-span-2 pt-4 border-t border-slate-100 mt-2">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    Career Intent & Target Roles
                                </h3>
                                <p className="text-[10px] text-slate-500 mb-4 font-medium italic">What roles are you looking for next? (Max: 3)</p>

                                {/* Current Roles */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(formData.targetRoles || []).map((role: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-bold transition-all group">
                                            <span>{role}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = (formData.targetRoles || []).filter((_: any, i: number) => i !== idx);
                                                    setFormData({ ...formData, targetRoles: updated });
                                                }}
                                                className="text-blue-300 hover:text-red-500"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {(formData.targetRoles || []).length === 0 && (
                                        <p className="text-xs text-slate-400">No target roles added yet.</p>
                                    )}
                                </div>

                                {/* Add Role Input */}
                                {(formData.targetRoles || []).length < 3 && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="new-role-input"
                                            placeholder="e.g. Junior Web Developer"
                                            className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm font-medium transition-all"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = (e.target as HTMLInputElement).value.trim();
                                                    if (val) {
                                                        setFormData({
                                                            ...formData,
                                                            targetRoles: [...(formData.targetRoles || []), val]
                                                        });
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('new-role-input') as HTMLInputElement;
                                                const val = input.value.trim();
                                                if (val) {
                                                    setFormData({
                                                        ...formData,
                                                        targetRoles: [...(formData.targetRoles || []), val]
                                                    });
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Logistics Section */}
                            <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Logistics & Transport</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase">
                                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                            Driver's License
                                        </label>
                                        <select
                                            value={formData.licenseCode || "None"}
                                            onChange={(e) => {
                                                const code = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    licenseCode: code === "None" ? "" : code,
                                                    haveLicense: code !== "None"
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white font-medium text-sm"
                                        >
                                            <option value="None">None / No License</option>
                                            <option value="Learners">Learner's License</option>
                                            <option value="Code 8 (B)">Code 8 / B (Light Vehicle)</option>
                                            <option value="Code 10 (C1)">Code 10 / C1 (Heavy Vehicle)</option>
                                            <option value="Code 14 (EC)">Code 14 / EC (Extra Heavy)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <label className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.haveCar ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                                        <input
                                            type="checkbox"
                                            checked={formData.haveCar}
                                            onChange={(e) => setFormData({ ...formData, haveCar: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${formData.haveCar ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <Car className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${formData.haveCar ? 'text-blue-700' : 'text-slate-600'}`}>Own Transport</p>
                                            <p className="text-[10px] text-slate-400">Personal vehicle</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            disabled={isUploading}
                            className={`flex-[2] py-3 px-12 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${isUploading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <Save className="w-5 h-5" />
                            {isUploading ? 'Uploading...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
