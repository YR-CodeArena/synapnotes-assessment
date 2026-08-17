import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { MeetingProvider } from "./context/MeetingContext";
import { ThemeProvider } from "./context/ThemeContext";
import ActionTrackerPage from "./pages/ActionTrackerPage";
import CreateMeetingPage from "./pages/CreateMeetingPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MeetingDetailPage from "./pages/MeetingDetailPage";
import MeetingsPage from "./pages/MeetingsPage";
import "./index.css";

function Root() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MeetingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <App />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="meetings/new" element={<CreateMeetingPage />} />
                <Route path="meetings/:id" element={<MeetingDetailPage />} />
                <Route path="actions" element={<ActionTrackerPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </MeetingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
