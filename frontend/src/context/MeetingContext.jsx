import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { actionsApi, analyticsApi, meetingsApi } from "../services/api";

const MeetingContext = createContext(null);

export function MeetingProvider({ children }) {
  const [meetings, setMeetings] = useState([]);
  const [actions, setActions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAll = useCallback(async (meetingParams = {}, actionParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const [meetingsRes, actionsRes, analyticsRes] = await Promise.all([
        meetingsApi.list(meetingParams),
        actionsApi.list(actionParams),
        analyticsApi.dashboard(),
      ]);
      setMeetings(meetingsRes.data);
      setActions(actionsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load workspace data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMeetings = useCallback(async (params = {}) => {
    const response = await meetingsApi.list(params);
    setMeetings(response.data);
    return response.data;
  }, []);

  const refreshActions = useCallback(async (params = {}) => {
    const response = await actionsApi.list(params);
    setActions(response.data);
    return response.data;
  }, []);

  const refreshAnalytics = useCallback(async () => {
    const response = await analyticsApi.dashboard();
    setAnalytics(response.data);
    return response.data;
  }, []);

  const createMeeting = useCallback(async (payload) => {
    const response = await meetingsApi.create(payload);
    await refreshAll();
    return response.data;
  }, [refreshAll]);

  const deleteMeeting = useCallback(async (id) => {
    await meetingsApi.remove(id);
    await refreshAll();
  }, [refreshAll]);

  const updateAction = useCallback(async (id, payload) => {
    const response = await actionsApi.update(id, payload);
    setActions((current) => current.map((item) => (item.id === id ? response.data : item)));
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      meetings,
      actions,
      analytics,
      loading,
      error,
      setError,
      refreshAll,
      refreshMeetings,
      refreshActions,
      refreshAnalytics,
      createMeeting,
      deleteMeeting,
      updateAction,
      openActionCount: actions.filter((item) => item.status !== "Completed").length,
    }),
    [meetings, actions, analytics, loading, error, refreshAll, refreshMeetings, refreshActions, refreshAnalytics, createMeeting, deleteMeeting, updateAction]
  );

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>;
}

export function useMeetings() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetings must be used within MeetingProvider");
  }
  return context;
}
