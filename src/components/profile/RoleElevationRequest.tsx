
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const RoleElevationRequest = () => {
  const { requestRoleElevation, user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      await requestRoleElevation();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!user || user.type !== 'attendee' || user.role_elevation_requested) {
    return null;
  }

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Role Elevation</CardTitle>
          <CardDescription>
            Want to create and manage events? Request to become an organizer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
              Organizer Privileges
            </h4>
            <ul className="mt-2 text-sm space-y-1 ml-7">
              <li>Create and publish your own events</li>
              <li>Manage event details and updates</li>
              <li>Track attendance and engagement</li>
              <li>Send notifications to event attendees</li>
            </ul>
          </div>
          
          <Button
            onClick={handleRequest}
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? "Submitting Request..." : "Request Organizer Role"}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Your request will be reviewed by an administrator. You'll be notified once it's approved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleElevationRequest;
