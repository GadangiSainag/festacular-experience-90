
import { Routes, Route, Outlet } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EventDetailWrapper from "./wrappers/EventDetailWrapper";
import MapWrapper from "./wrappers/MapWrapper";
import TimelineWrapper from "./wrappers/TimelineWrapper";
import NotFound from "./pages/NotFound";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Index />} />
        <Route path="auth/*" element={<Auth />} />
        <Route path="event/:id" element={<EventDetailWrapper />} />
        <Route path="map" element={<MapWrapper />} />
        <Route path="timeline" element={<TimelineWrapper />} />
        
        {/* Protected routes */}
        <Route
          path="profile/*"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
