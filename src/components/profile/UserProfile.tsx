
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";

interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) return null;

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
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{user.type}</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="mt-1">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p className="mt-1">{user.phone}</p>
                  </div>
                )}
                {user.college && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">College</h4>
                    <p className="mt-1">{user.college}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
                    <p className="mt-1">{user.department}</p>
                  </div>
                )}
                {user.course && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Course</h4>
                    <p className="mt-1">{user.course}</p>
                  </div>
                )}
                {user.admission_year && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Admission Year</h4>
                    <p className="mt-1">{user.admission_year}</p>
                  </div>
                )}
                {user.passout_year && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Passout Year</h4>
                    <p className="mt-1">{user.passout_year}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                  <p className="mt-1">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
