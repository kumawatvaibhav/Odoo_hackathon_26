import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth-context";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState("Travel enthusiast exploring the world one loop at a time.");
  const [city, setCity] = useState(user.city || "");
  const [country, setCountry] = useState(user.country || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profile_photo_url);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Call PUT /api/auth/profile when endpoint is ready
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  };

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl bg-card border border-border/70 shadow-elegant overflow-hidden"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <h3 className="font-display font-semibold text-lg text-charcoal">Edit Profile</h3>
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-muted/60 transition-colors cursor-pointer"
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Avatar upload */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-teal/30" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xl font-bold border-2 border-teal/30">
                      {initials}
                    </div>
                  )}
                  <motion.button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border border-border shadow-card grid place-items-center text-charcoal/70 hover:text-teal transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera size={14} />
                  </motion.button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal">Profile Photo</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-first">First name</Label>
                  <Input id="edit-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-last">Last name</Label>
                  <Input id="edit-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-bio">Bio</Label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-charcoal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  placeholder="Tell the world about your travel adventures..."
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-city">City</Label>
                  <Input id="edit-city" value={city} onChange={(e) => setCity(e.target.value)} className="h-10" placeholder="Mumbai" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" value={country} onChange={(e) => setCountry(e.target.value)} className="h-10" placeholder="India" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={15} className="animate-spin mr-1.5" /> : null}
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
