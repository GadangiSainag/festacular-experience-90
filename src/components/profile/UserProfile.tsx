
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { Camera, Edit, Mail, Phone, School, Building, BookOpen, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { user: authUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  if (!user) return null;

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      setUploading(true);

      // Check if the storage bucket exists, if not display a message to the user
      const { data: bucketsList } = await supabase.storage.listBuckets();
      if (!bucketsList || !bucketsList.some(bucket => bucket.name === 'avatars')) {
        toast.error("Avatar storage not configured. Please ask an administrator to set up the avatars bucket.");
        setUploading(false);
        return;
      }

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (data) {
        setAvatarUrl(data.publicUrl);
        
        // Update the user profile with the avatar URL
        await supabase
          .from('users')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user.id);
          
        toast.success("Profile picture updated");
      }
    } catch (error: any) {
      toast.error(error.message || "Error uploading avatar");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {user.id === authUser?.id && (
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUploadAvatar}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground capitalize bg-secondary/50 px-3 py-1 rounded-full inline-block">
                  {user.type}
                </p>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Email</h4>
                    <p className="mt-1">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Phone</h4>
                      <p className="mt-1">{user.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.college && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">College</h4>
                      <p className="mt-1">{user.college}</p>
                    </div>
                  </div>
                )}
                
                {user.department && (
                  <div className="flex items-start gap-3">
                    <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Department</h4>
                      <p className="mt-1">{user.department}</p>
                    </div>
                  </div>
                )}
                
                {user.course && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Course</h4>
                      <p className="mt-1">{user.course}</p>
                    </div>
                  </div>
                )}
                
                {user.admission_year && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Admission Year</h4>
                      <p className="mt-1">{user.admission_year}</p>
                    </div>
                  </div>
                )}
                
                {user.passout_year && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Passout Year</h4>
                      <p className="mt-1">{user.passout_year}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Member Since</h4>
                    <p className="mt-1">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              {user.id === authUser?.id && (
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => document.getElementById('settings')?.click()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
