import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfile from "@/components/profile/UserProfile";
import StarredEvents from "@/components/profile/StarredEvents";
import RoleElevationRequest from "@/components/profile/RoleElevationRequest";
import EventManagement from "@/components/profile/EventManagement";
import UserSettings from "@/components/profile/UserSettings";
import AdminPanel from "@/components/profile/AdminPanel";
import { Event } from "@/types";
import { UserCircle, Star, Settings, Calendar, Users, LogOut } from "lucide-react";
import { safeEventArray } from "@/lib/utils";
import { db } from "@/integrations/supabase/db";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: starredEvents } = useQuery({
    queryKey: ['starredEvents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return db.starredEvents.getByUser(user.id);
    },
    enabled: !!user,
  });

  const { data: userEvents } = useQuery({
    queryKey: ['userEvents', user?.id],
    queryFn: async () => {
      if (!user || (user.type !== 'organizer' && user.type !== 'admin')) return [];
      return db.events.getByOrganizer(user.id);
    },
    enabled: !!user && (user.type === 'organizer' || user.type === 'admin'),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader className="flex items-center px-4 py-2">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.type}</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Profile" asChild>
                      <a href="#profile">
                        <UserCircle />
                        <span>Profile</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Starred Events" asChild>
                      <a href="#starred">
                        <Star />
                        <span>Starred Events</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings" asChild>
                      <a href="#settings">
                        <Settings />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              {(user?.type === 'organizer' || user?.type === 'admin') && (
                <SidebarGroup>
                  <SidebarGroupLabel>Management</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Events" asChild>
                        <a href="#events">
                          <Calendar />
                          <span>Events</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {user?.type === 'admin' && (
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Users" asChild>
                          <a href="#users">
                            <Users />
                            <span>Users</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroup>
              )}
            </SidebarContent>
            <SidebarFooter className="p-4">
              <Button variant="outline" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="p-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="starred">Starred Events</TabsTrigger>
                {(user?.type === 'organizer' || user?.type === 'admin') && (
                  <TabsTrigger value="events">Event Management</TabsTrigger>
                )}
                {user?.type === 'admin' && (
                  <TabsTrigger value="users">Admin Panel</TabsTrigger>
                )}
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" id="profile">
                <UserProfile user={user} />
                {user?.type === 'attendee' && !user?.role_elevation_requested && (
                  <RoleElevationRequest />
                )}
              </TabsContent>
              
              <TabsContent value="starred" id="starred">
                <StarredEvents starredEvents={starredEvents || []} />
              </TabsContent>
              
              {(user?.type === 'organizer' || user?.type === 'admin') && (
                <TabsContent value="events" id="events">
                  <EventManagement events={userEvents || []} />
                </TabsContent>
              )}
              
              {user?.type === 'admin' && (
                <TabsContent value="users" id="users">
                  <AdminPanel />
                </TabsContent>
              )}
              
              <TabsContent value="settings" id="settings">
                <UserSettings user={user} />
              </TabsContent>
            </Tabs>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </motion.div>
  );
};

export default Profile;
