import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_URL
});

export const analyzeReturn = (comment) =>
  API.post("/analyze-return", { comment });

export const getAnalytics = () =>
  API.get("/analytics/top-return-reasons");

export const draftResolutionEmail = (data) =>
  API.post("/api/advanced/draft-email", data);

export const queryOracle = (data) =>
  API.post("/api/advanced/oracle", data);

export const getCustomerMatrix = (data) =>
  API.post("/api/advanced/customer-matrix", data);

// --- Strategic Briefing & Action Tracking ---

export const getActions = () =>
  API.get("/api/advanced/actions");

export const createAction = (data) =>
  API.post("/api/advanced/actions", data);

export const updateActionStatus = (id, status) =>
  API.patch(`/api/advanced/actions/${id}`, { status });

export const getStrategicBriefing = () =>
  API.get("/api/advanced/strategic-briefing");

export default API;
