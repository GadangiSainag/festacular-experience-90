
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarredEvents from "@/components/profile/StarredEvents";
import UserEvents from "@/components/profile/UserEvents";

const Profile = () => {
  const { user, updateProfile, requestRoleElevation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      college: user?.college || "",
      department: user?.department || "",
      course: user?.course || "",
      admission_year: user?.admission_year || undefined,
      passout_year: user?.passout_year || undefined,
    }
  });

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const onSubmit = async (data: any) => {
    await updateProfile(data);
    setIsEditing(false);
  };

  const handleRoleRequest = async () => {
    await requestRoleElevation();
  };

  const getRoleBadgeColor = (type: UserType) => {
    switch (type) {
      case 'admin':
        return "bg-red-500";
      case 'organizer':
        return "bg-blue-500";
      case 'attendee':
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSubmit(onSubmit)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Basic account information and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 text-center mb-4">
                <h3 className="text-xl font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge className={getRoleBadgeColor(user.type)}>
                    {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                  </Badge>
                  {user.role_elevation_requested && (
                    <Badge variant="outline">Role Request Pending</Badge>
                  )}
                </div>
              </div>
              
              {user.type === 'attendee' && !user.role_elevation_requested && (
                <Button 
                  className="w-full"
                  onClick={handleRoleRequest}
                >
                  Request Organizer Role
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Your personal and academic information</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("phone")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="college">College/University</Label>
                    <Input
                      id="college"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("college")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("department")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("course")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admission_year">Admission Year</Label>
                    <Input
                      id="admission_year"
                      type="number"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("admission_year", {
                        valueAsNumber: true,
                        validate: value => 
                          !value || (value >= 1900 && value <= new Date().getFullYear()) || 
                          "Please enter a valid year"
                      })}
                    />
                    {errors.admission_year && (
                      <p className="text-sm text-red-500">{errors.admission_year.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passout_year">Passout Year</Label>
                    <Input
                      id="passout_year"
                      type="number"
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      {...register("passout_year", {
                        valueAsNumber: true,
                        validate: value => 
                          !value || (value >= 1900 && value <= new Date().getFullYear() + 10) || 
                          "Please enter a valid year"
                      })}
                    />
                    {errors.passout_year && (
                      <p className="text-sm text-red-500">{errors.passout_year.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="starred" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="starred">Starred Events</TabsTrigger>
            {user.type !== 'attendee' && (
              <TabsTrigger value="myevents">My Events</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="starred" className="mt-6">
            <StarredEvents />
          </TabsContent>
          {user.type !== 'attendee' && (
            <TabsContent value="myevents" className="mt-6">
              <UserEvents />
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Profile;
