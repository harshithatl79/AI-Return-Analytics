import React, { useState } from "react";
import { Grid, Card, CardContent, TextField, Button, Typography, ThemeProvider, createTheme, Box, Fade, Avatar, Chip, Snackbar, Alert, Divider, Modal, IconButton, Slide, CircularProgress, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import axios from "axios";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChatIcon from '@mui/icons-material/Chat';
import GridOnIcon from '@mui/icons-material/GridOn';
import { ScatterChart, Scatter, ZAxis } from 'recharts';
import AdvancedAiToolkit from "./components/AdvancedAiToolkit";
import { draftResolutionEmail, queryOracle, getCustomerMatrix } from "./services/api";
import './App.css';

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    secondary: { main: '#ec4899' },
    background: { default: '#020617', paper: '#0f172a' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 500 }
  },
});

const monthlyData = [
  { name: 'Jan', returns: 400, cost: 2400 },
  { name: 'Feb', returns: 300, cost: 2210 },
  { name: 'Mar', returns: 200, cost: 2290 },
  { name: 'Apr', returns: 278, cost: 2000 },
  { name: 'May', returns: 189, cost: 2181 },
  { name: 'Jun', returns: 239, cost: 2500 },
  { name: 'Jul', returns: 349, cost: 2100 },
];

const reasonsData = [
  { name: "Sizing/Fit Issue", value: 45 },
  { name: "Item Defective", value: 25 },
  { name: "Not as Pictured", value: 15 },
  { name: "Late Delivery", value: 10 },
  { name: "Buyer Remorse", value: 5 }
];

const financialDataMock = [
  { category: "Footwear", revenueLost: 45000, revenueRetained: 120000 },
  { category: "Apparel", revenueLost: 25000, revenueRetained: 85000 },
  { category: "Electronics", revenueLost: 32000, revenueRetained: 150000 },
  { category: "Accessories", revenueLost: 8000, revenueRetained: 40000 }
];

function KPICard({ title, value, subtitle, icon, color }) {
  return (
    <Card className="glass-card kpi-card" sx={{ height: '160px !important' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography color="textSecondary" variant="h6" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.9rem', fontWeight: 600 }}>{title}</Typography>
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>{value}</Typography>
        <Typography variant="body1" sx={{ color, mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
          <TrendingUpIcon sx={{ fontSize: 20 }} /> {subtitle}
        </Typography>
        <Box className="kpi-icon" sx={{ fontSize: '100px !important' }}>{icon}</Box>
      </CardContent>
    </Card>
  );
}

const SimulatorSlider = ({ label, value, onChange, min = 0, max = 100, unit = '%' }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 700 }}>{value}{unit}</Typography>
    </Box>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      style={{
        width: '100%',
        height: '6px',
        borderRadius: '5px',
        background: 'rgba(139, 92, 246, 0.2)',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer'
      }}
    />
  </Box>
);

function App() {
  const [comment, setComment] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadAnalysis, setUploadAnalysis] = useState(null);
  const [advancedInsights, setAdvancedInsights] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // New UI State for making buttons functional
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Data Oracle State
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResult, setOracleResult] = useState(null);
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  // Customer Matrix State (Removed as per request)

  // AI Email drafting state
  const [emailDraft, setEmailDraft] = useState(null);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Financial Simulator State
  const [recoveryCoverage, setRecoveryCoverage] = useState(65); // % of issues addressable by AI
  const [recoveryEfficiency, setRecoveryEfficiency] = useState(45); // % effectiveness of fix

  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Real backend integration to consume the new JSON structured output
  const analyzeComment = async () => {
    if (!comment.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null); // Clear previous

    try {
      const res = await axios.post("http://127.0.0.1:8000/ai/analyze-return", { comment });
      // The backend now returns { analysis: { summary: "...", cause: "...", recommendation: "...", urgency: "..." } }
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error("Backend Error:", error);
      setAnalysis({
        summary: "Connection to the AI analysis engine failed. Please ensure the backend is running.",
        cause: "Network / Server Error",
        recommendation: "Check that uvicorn is running on port 8000 and MISTRAL_API_KEY is set.",
        urgency: "High"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = async () => {
    showNotification("Initiating export sequence. Your Retail Analytics Report will download shortly.", "info");
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/export", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Retail_Analytics_Report.csv');
      document.body.appendChild(link);
      link.click();
      showNotification("Report downloaded successfully.", "success");
    } catch (error) {
      showNotification("Failed to download report.", "error");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    showNotification("Uploading dataset and generating AI insights in parallel...", "info");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/dataset/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showNotification(response.data.message || "Dataset ingested successfully!", "success");
      if (response.data.analysis) {
        setUploadAnalysis(response.data.analysis);
      }
      if (response.data.advanced_insights) {
        setAdvancedInsights(response.data.advanced_insights);
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to upload dataset.";
      showNotification(errMsg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDraftEmail = async (context) => {
    setIsDraftingEmail(true);
    showNotification("Drafting AI resolution email...", "info");
    try {
      const response = await draftResolutionEmail(context);
      setEmailDraft(response.data);
      setIsEmailModalOpen(true);
      showNotification("AI Email Draft ready!", "success");
    } catch (error) {
      showNotification("Failed to generate email draft.", "error");
    } finally {
      setIsDraftingEmail(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("Copied to clipboard!", "success");
  };

  const handleOracleQuery = async () => {
    if (!oracleQuery.trim()) return;
    setIsOracleLoading(true);
    try {
      const res = await queryOracle({
        query: oracleQuery,
        context: JSON.stringify(uploadAnalysis || "No data uploaded yet.")
      });
      setOracleResult(res.data);
    } catch (error) {
      showNotification("Oracle is offline. Check backend.", "error");
    } finally {
      setIsOracleLoading(false);
    }
  };

  // fetchMatrixData removed

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', p: 1.5, borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>{label || payload[0].name}</Typography>
          {payload.map((p, i) => (
            <Typography key={i} variant="body2" sx={{ color: p.color || PIE_COLORS[i], fontWeight: 600 }}>
              {`${p.name} : ${p.value}`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="dashboard-root">
        {/* Sidebar */}
        <div className="sidebar">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6, mt: 2 }}>
            <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
              <StorefrontIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Retail<br />Analyzer</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['Dashboard', 'Upload & Analyze Trends', 'Financial Impact', 'Strategic Resolution Center'].map((item, i) => (
              <Button
                key={item}
                onClick={() => {
                  setActiveTab(item);
                  if (item !== 'Dashboard') showNotification(`Navigating to ${item} section...`, 'info');
                }}
                startIcon={
                  item === 'Strategic Resolution Center' ? <SecurityIcon /> :
                    null
                }
                sx={{
                  justifyContent: 'flex-start',
                  color: activeTab === item ? '#fff' : '#94a3b8',
                  background: activeTab === item ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: activeTab === item ? 600 : 500,
                  '&:hover': { background: 'rgba(139, 92, 246, 0.1)', color: '#fff' }
                }}
              >
                {item}
              </Button>
            ))}

          </Box>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <Box sx={{
            width: '100%',
            px: 0,
            py: { xs: 1, md: 3 },
            maxWidth: 'none',
            m: 0
          }}>
            {activeTab === 'Dashboard' ? (
              <Fade in={true} timeout={500}>
                <Box sx={{ width: '100%', p: 0, m: 0 }}>
                  {/* Header Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, px: { xs: 2, md: 5 }, mt: 2 }}>
                    <Box>
                      <Typography variant="h3" className="gradient-text" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>Retail Return Analytics</Typography>
                      <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.7, fontWeight: 400, maxWidth: '800px' }}>
                        Synthesizing eCommerce dataset intelligence for strategic retail intervention and revenue recovery.
                      </Typography>
                    </Box>
                  </Box>

                  {/* KPI Row */}
                  <Box sx={{ px: { xs: 2, md: 5 }, mb: 5 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6} md={3}>
                        <KPICard title="Total Returns (MTD)" value="1,245" subtitle="-8% vs Prev Month" color="#10b981" icon={<StorefrontIcon />} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KPICard title="Controllable Leakage" value="68%" subtitle="+2% Quality Drift" color="#ef4444" icon={<WarningAmberIcon />} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KPICard title="Projected Exposure" value="₹2.4L" subtitle="Estimated Q4 Risk" color="#f59e0b" icon={<AttachMoneyIcon />} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <KPICard title="Intervention ROI" value="+₹85k" subtitle="Savings from AI Actions" color="#3b82f6" icon={<AutoAwesomeIcon />} />
                      </Grid>
                    </Grid>
                  </Box>


                  {/* Charts Row */}
                  <Box sx={{ px: { xs: 2, md: 5 }, mb: 6 }}>
                    <Grid container spacing={4}>
                      <Grid item xs={12} lg={8}>
                        <Card className="glass-card" sx={{ height: '520px', p: 1 }}>
                          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Typography variant="h6" mb={3} sx={{ fontWeight: 600, color: '#f8fafc' }}>Return Volume & Estimated Cost (YTD)</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                  <defs>
                                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} dx={-10} />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Area type="monotone" dataKey="returns" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} lg={4}>
                        <Card className="glass-card" sx={{ height: '520px', p: 1 }}>
                          <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Typography variant="h6" mb={2} sx={{ fontWeight: 600, color: '#f8fafc' }}>Summarized Return Causes</Typography>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                  <Pie data={reasonsData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={5} stroke="none" cx="50%" cy="40%">
                                    {reasonsData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '11px' }}>{value}</span>} />
                                </PieChart>
                              </ResponsiveContainer>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Specialized AI Analyzer Section */}
                  <Box sx={{ px: { xs: 2, md: 5 }, pb: 5 }}>
                    <Card className="glass-card" sx={{ overflow: 'visible' }}>
                      <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Grid container spacing={4} sx={{ flexGrow: 1 }} alignItems="stretch">
                          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ pr: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#c084fc' }}>
                                <AutoAwesomeIcon fontSize="large" /> Root Cause Extraction
                              </Typography>
                              <Typography variant="body1" color="textSecondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                                Process raw customer complaints from your eCommerce dataset. The AI will synthesize the core return cause and output a strategic business recommendation.
                              </Typography>
                              <TextField
                                className="ai-textarea"
                                fullWidth multiline rows={5}
                                placeholder="Paste eCommerce review here... e.g., 'The boots look great but the sole ripped off after wearing them twice. Also they squeeze my toes a lot, definitely run small.'"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{ mb: 3, flexGrow: 1 }}
                              />
                              <Button className="glow-button" size="large" onClick={analyzeComment} disabled={isAnalyzing || !comment.trim()} startIcon={!isAnalyzing && <AutoAwesomeIcon />}>
                                {isAnalyzing ? "Processing AI Insight..." : "Generate Recommendation"}
                              </Button>
                            </Box>
                          </Grid>

                          {/* Advanced Output Panel */}
                          <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box className="ai-result-box" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <Typography variant="overline" sx={{ color: '#a855f7', letterSpacing: 2, fontWeight: 700, mb: 2 }}>AI Structured Output</Typography>

                              {analysis ? (
                                <Fade in={!!analysis} timeout={800}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                                    {/* Cause Section */}
                                    <Box sx={{ background: 'rgba(255,255,255,0.03)', p: 2.5, borderRadius: '12px', borderLeft: '3px solid #ef4444' }}>
                                      <Typography variant="subtitle2" sx={{ color: '#ef4444', textTransform: 'uppercase', mb: 1, letterSpacing: 1 }}>Extracted Cause</Typography>
                                      <Typography variant="body1" sx={{ color: '#f8fafc', fontWeight: 500 }}>{analysis.cause}</Typography>
                                    </Box>

                                    {/* Summary Section */}
                                    <Box>
                                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Customer Sentiment Summary</Typography>
                                      <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>{analysis.summary}</Typography>
                                    </Box>

                                    {/* Recommendation Section */}
                                    <Box sx={{ background: 'rgba(16, 185, 129, 0.1)', p: 2.5, borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>Business Recommendation</Typography>
                                        <Chip label={`${analysis.urgency} Urgency`} size="small" sx={{ background: analysis.urgency === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: analysis.urgency === 'High' ? '#ef4444' : '#3b82f6', fontWeight: 600 }} />
                                      </Box>
                                      <Typography variant="body1" sx={{ color: '#f8fafc', lineHeight: 1.6 }}>{analysis.recommendation}</Typography>
                                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                          size="small"
                                          startIcon={<AutoAwesomeIcon />}
                                          onClick={() => handleDraftEmail({
                                            sku: "Single Case",
                                            issue: analysis.cause,
                                            action: analysis.recommendation,
                                            recipient_type: "internal/customer"
                                          })}
                                          sx={{ color: '#10b981', textTransform: 'none', fontWeight: 600 }}
                                        >
                                          Draft Resolution Email
                                        </Button>
                                      </Box>
                                    </Box>

                                  </Box>
                                </Fade>
                              ) : (
                                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Typography variant="body1" sx={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center', maxWidth: '80%' }}>
                                    Submit a comment to extract structured root causes and generate actionable retail recommendations.
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Fade>
            ) : activeTab === 'Upload & Analyze Trends' ? (
              <Fade in={true} timeout={500}>
                <Box sx={{ width: '100%', p: 0, m: 0 }}>
                  {!uploadAnalysis ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', p: 4, textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 80, color: '#8b5cf6', mb: 3, opacity: 0.8 }} />
                      <Typography variant="h2" className="gradient-text" sx={{ fontWeight: 800, mb: 2 }}>Intelligence Data Ingestion</Typography>
                      <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: '700px', mb: 5, fontWeight: 400 }}>
                        Seamlessly vectorize and analyze massive eCommerce datasets. Our RAG-powered engine identifies anomalies and predicts financial risk in parallel.
                      </Typography>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isUploading}
                        sx={{ background: '#8b5cf6', '&:hover': { background: '#7c3aed' }, py: 1.5, px: 4, borderRadius: '12px', textTransform: 'none', fontSize: '1.1rem' }}
                      >
                        {isUploading ? "Analyzing Dataset..." : "Select Dataset File"}
                        {!isUploading && <input type="file" hidden accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} />}
                      </Button>

                      {isUploading && (
                        <Typography variant="caption" sx={{ mt: 2, color: '#8b5cf6', animation: 'pulse 2s infinite' }}>
                          This may take 10-15 seconds as our AI models process the data...
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', p: 0 }}>
                      <Box sx={{ px: { xs: 2, md: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, mt: 2 }}>
                        <Box>
                          <Typography variant="h3" className="gradient-text" sx={{ fontWeight: 800, mb: 1 }}>Dataset Intelligence Matrix</Typography>
                          <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.7, fontWeight: 400 }}>
                            Aggregated insights and predictive forecasting from ingested return data.
                          </Typography>
                        </Box>
                        <Button variant="outlined" component="label" sx={{ borderColor: 'rgba(139, 92, 246, 0.5)', color: '#8b5cf6', borderRadius: '12px', px: 3 }}>
                          New Ingestion
                          <input type="file" hidden accept=".csv,.json,.xlsx,.xls" onChange={(e) => { setUploadAnalysis(null); setAdvancedInsights(null); handleFileUpload(e); }} />
                        </Button>
                      </Box>

                      <Box sx={{ px: { xs: 2, md: 5 } }}>
                        <Grid container spacing={4} sx={{ mb: 5 }}>
                          <Grid item xs={12} md={6}>
                            <Card sx={{ background: 'rgba(30,30,40,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 4, height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="h6" sx={{ color: '#f8fafc', mb: 3, textAlign: 'center' }}>Distribution of Return Reasons</Typography>
                              <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                  <Pie data={uploadAnalysis} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" nameKey="name">
                                    {uploadAnalysis.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                              </ResponsiveContainer>
                            </Card>
                          </Grid>

                          {advancedInsights && (
                            <Grid item xs={12} md={6}>
                              <Card sx={{ background: 'rgba(30,30,40,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', p: 4, height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                                <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Financial Forecast</Typography>
                                <Typography variant="h3" sx={{ color: '#ef4444', mb: 1 }}>{advancedInsights.financial_forecast[0]?.projected_q4_loss || "N/A"}</Typography>
                                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 5 }}>Projected loss due to: {advancedInsights.financial_forecast[0]?.preventable_variable || "Unknown"}</Typography>

                                <Typography variant="subtitle2" sx={{ color: '#ec4899', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>Sentiment Scoring</Typography>
                                <Typography variant="h3" sx={{ color: '#fff', mb: 1 }}>{advancedInsights.sentiment_scores[0]?.average_frustration_score || "N/A"} / 10</Typography>
                                <Typography variant="body1" sx={{ color: '#94a3b8' }}>Frustration driver: {advancedInsights.sentiment_scores[0]?.driver || "Unknown"}</Typography>
                              </Card>
                            </Grid>
                          )}
                        </Grid>

                        {advancedInsights && (
                          <Box sx={{ mt: 8 }}>
                            <Divider sx={{ mb: 6, opacity: 0.1 }} />

                            {/* Section 1: Anomalies */}
                            <Typography variant="h5" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <WarningAmberIcon sx={{ color: '#ef4444' }} /> High-Risk Operational Anomalies
                            </Typography>
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                              {advancedInsights.anomaly_alerts?.map((alert, i) => (
                                <Grid item xs={12} md={4} key={`anomaly-${i}`}>
                                  <Card className="premium-border" sx={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{alert.sku}</Typography>
                                        <Chip label={alert.spike_percentage} color="error" size="small" sx={{ fontWeight: 800 }} />
                                      </Box>
                                      <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}><strong>Issue:</strong> {alert.issue}</Typography>
                                      <Box sx={{ mt: 2, p: 1.5, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                        <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 600, display: 'block', mb: 0.5 }}>AI PRESCRIBED ACTION</Typography>
                                        <Typography variant="body2" sx={{ color: '#fff' }}>{alert.action}</Typography>
                                      </Box>
                                      <Box sx={{ mt: 2 }}>
                                        <Button
                                          fullWidth
                                          size="small"
                                          variant="outlined"
                                          onClick={() => handleDraftEmail({
                                            sku: alert.sku,
                                            issue: alert.issue,
                                            action: alert.action,
                                            recipient_type: "Quality/Production Team"
                                          })}
                                          sx={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5', textTransform: 'none' }}
                                        >
                                          Draft Operational Ticket
                                        </Button>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>

                            {/* Section 2: Workflows */}
                            <Typography variant="h5" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <TrendingUpIcon sx={{ color: '#3b82f6' }} /> Strategic Service Orchestration
                            </Typography>
                            <Grid container spacing={3} sx={{ mb: 6 }}>
                              {advancedInsights.workflow_routing?.map((route, i) => (
                                <Grid item xs={12} md={4} key={`route-${i}`}>
                                  <Card sx={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>{route.department}</Typography>
                                        <Chip label={`${route.ticket_volume} Priority`} color="primary" size="small" />
                                      </Box>
                                      <Typography variant="overline" sx={{ color: '#93c5fd', display: 'block', mb: 1 }}>TOP TASK TO RESOLVE</Typography>
                                      <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{route.top_issue_to_resolve}</Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>

                            {/* Section 3: Suppliers */}
                            <Typography variant="h5" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <StorefrontIcon sx={{ color: '#10b981' }} /> Supplier Performance Scorecards
                            </Typography>
                            <Grid container spacing={3}>
                              {advancedInsights.supplier_scorecards?.map((supplier, i) => (
                                <Grid item xs={12} md={4} key={`supplier-${i}`}>
                                  <Card sx={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, noWrap: true }}>{supplier.supplier_type}</Typography>
                                        <Avatar sx={{ bgcolor: supplier.grade === 'A' ? '#10b981' : supplier.grade === 'B' ? '#3b82f6' : '#f59e0b', width: 32, height: 32, fontSize: '0.9rem', fontWeight: 800 }}>
                                          {supplier.grade}
                                        </Avatar>
                                      </Box>
                                      <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}><strong>Primary Defect:</strong> {supplier.primary_defect}</Typography>
                                      <Typography variant="body2" sx={{ color: '#6ee7b7', fontStyle: 'italic' }}>{supplier.action_required}</Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )}

                        {/* Embedded Contextual Data Oracle */}
                        <Box sx={{ mt: 8 }}>
                          <Divider sx={{ mb: 6, opacity: 0.1 }} />
                          <Typography variant="h5" sx={{ color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <ChatIcon sx={{ color: '#8b5cf6' }} /> Contextual Data Oracle
                          </Typography>
                          <Paper sx={{ p: 4, background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                            <Grid container spacing={4}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>Query Dataset Intelligence</Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                                  Ask the Oracle deep-dive questions about the current dataset distribution, financial risks, or supplier defects.
                                </Typography>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={4}
                                  placeholder="Example: 'What is the projected Q4 risk for Footwear?'"
                                  value={oracleQuery}
                                  onChange={(e) => setOracleQuery(e.target.value)}
                                  sx={{
                                    mb: 3,
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: '16px',
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '16px',
                                      color: '#e2e8f0'
                                    }
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  className="glow-button"
                                  fullWidth
                                  disabled={isOracleLoading || !oracleQuery.trim()}
                                  onClick={handleOracleQuery}
                                  sx={{ py: 2, borderRadius: '12px', fontWeight: 700 }}
                                >
                                  {isOracleLoading ? <CircularProgress size={24} color="inherit" /> : "Request AI Insight"}
                                </Button>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box sx={{
                                  height: '100%',
                                  minHeight: '250px',
                                  background: 'rgba(30, 41, 59, 0.4)',
                                  borderRadius: '20px',
                                  p: 3,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  border: '1px dashed rgba(139, 92, 246, 0.2)'
                                }}>
                                  {oracleResult ? (
                                    <Fade in={true}>
                                      <Box>
                                        <Typography variant="overline" sx={{ color: '#8b5cf6', fontWeight: 800, letterSpacing: 1 }}>ANALYSIS RESULT</Typography>
                                        <Typography variant="h6" sx={{ color: '#fff', mt: 1, mb: 1, fontWeight: 700 }}>{oracleResult.summary}</Typography>
                                        <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 800, mb: 2 }}>{oracleResult.key_metric}</Typography>
                                        <Divider sx={{ mb: 2, opacity: 0.1 }} />
                                        <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: 1.6 }}>{oracleResult.recommendation}</Typography>
                                      </Box>
                                    </Fade>
                                  ) : (
                                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4, textAlign: 'center' }}>
                                      <Typography variant="body2" sx={{ color: '#94a3b8' }}>Oracle is awaiting your query...</Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Fade>
            ) : activeTab === 'Financial Impact' ? (
              <Fade in={true} timeout={500}>
                <Box sx={{ width: '100%', p: 0, m: 0 }}>
                  {/* Hero Financial KPIs */}
                  <Box sx={{ px: { xs: 2, md: 5 }, mb: 5, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 4 }}>
                      <Typography variant="h3" className="gradient-text" sx={{ fontWeight: 800 }}>Revenue Recovery Model</Typography>
                      <Typography variant="body1" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>Real-time recovery simulation based on AI intervention</Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card className="glass-card" sx={{ p: 4, height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #ef4444' }}>
                          <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 2, fontWeight: 700 }}>Total Revenue Leakage</Typography>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#ef4444' }}>
                            ₹{financialDataMock.reduce((acc, curr) => acc + curr.revenueLost, 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>Current quarterly run-rate</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card className="glass-card" sx={{ p: 4, height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05) !important' }}>
                          <Typography variant="overline" sx={{ color: '#10b981', letterSpacing: 2, fontWeight: 700 }}>Simulated recovery</Typography>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#10b981' }}>
                            ₹{Math.round(financialDataMock.reduce((acc, curr) => acc + curr.revenueLost, 0) * (recoveryCoverage / 100) * (recoveryEfficiency / 100)).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>Based on active simulation params</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card className="glass-card" sx={{ p: 4, height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #3b82f6' }}>
                          <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 2, fontWeight: 700 }}>Projected Net Risk</Typography>
                          <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff' }}>
                            ₹{Math.round(financialDataMock.reduce((acc, curr) => acc + curr.revenueLost, 0) * (1 - (recoveryCoverage / 100) * (recoveryEfficiency / 100))).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>Residual exposure after AI intervention</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ px: { xs: 2, md: 5 } }}>
                    <Grid container spacing={4} alignItems="stretch">
                      {/* Main Analysis Chart */}
                      <Grid item xs={12} lg={8}>
                        <Card className="glass-card premium-border" sx={{ p: 4, height: '100%', minHeight: '520px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h5" sx={{ color: '#f8fafc', fontWeight: 700 }}>Vertical Leakage vs. Simulation</Typography>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#ef4444' }} />
                                <Typography variant="caption" color="textSecondary">Current Leakage</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '2px', bgcolor: '#8b5cf6' }} />
                                <Typography variant="caption" color="textSecondary">Simulated Recovery</Typography>
                              </Box>
                            </Box>
                          </Box>

                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={financialDataMock.map(d => ({
                                ...d,
                                simulated_recovery: Math.round(d.revenueLost * (recoveryCoverage / 100) * (recoveryEfficiency / 100))
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="category" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                              <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${value / 1000}k`} axisLine={false} tickLine={false} />
                              <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' }}
                                itemStyle={{ fontWeight: 600, color: '#fff' }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                              />
                              <Bar dataKey="revenueLost" name="Current Leakage" fill="rgba(239, 68, 68, 0.4)" radius={[0, 0, 0, 0]} barSize={50} />
                              <Bar dataKey="simulated_recovery" name="Simulated Recovery" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      </Grid>

                      {/* Interactive Simulator Panel */}
                      <Grid item xs={12} lg={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
                          <Card className="glass-card premium-border" sx={{ p: 4, flexGrow: 1, background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.7)) !important' }}>
                            <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>Recovery Simulator</Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>Adjust parameters to forecast ROI based on AI adoption</Typography>

                            <Box sx={{ mt: 2 }}>
                              <SimulatorSlider
                                label="AI recommendation coverage"
                                value={recoveryCoverage}
                                onChange={setRecoveryCoverage}
                              />
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 4 }}>
                                Estimates percentage of return causes that can be addressed via AI automation.
                              </Typography>

                              <SimulatorSlider
                                label="Average Resolution Efficiency"
                                value={recoveryEfficiency}
                                onChange={setRecoveryEfficiency}
                              />
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 4 }}>
                                Predicted success rate of interventions (halted sales, guide updates, etc.).
                              </Typography>
                            </Box>

                            <Box sx={{ mt: 4, p: 3, background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: '#c084fc', fontWeight: 600 }}>Estimated Impact Grade</Typography>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                                  {recoveryCoverage * recoveryEfficiency > 4000 ? 'EXCEPTIONAL' : recoveryCoverage * recoveryEfficiency > 2000 ? 'OPTIMAL' : 'MODERATE'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                This simulation projects a {((recoveryCoverage / 100) * (recoveryEfficiency / 100) * 100).toFixed(1)}% recovery of currently lost revenue.
                              </Typography>
                            </Box>
                          </Card>

                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Fade>
            ) : activeTab === 'Strategic Resolution Center' ? (
              <Fade in={true} timeout={500}>
                <Box sx={{ width: '100%', p: 0, py: 2 }}>
                  <AdvancedAiToolkit />
                </Box>
              </Fade>
            ) : (
              <Fade in={true} timeout={500}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 3, opacity: 0.5 }} />
                  <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>{activeTab}</Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: '500px', textAlign: 'center' }}>
                    This module is currently receiving real-time data from the warehouse and will be enabled in the production build. Return to the Dashboard to use the Cortex AI Analyzer.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 4, borderRadius: '10px' }} onClick={() => setActiveTab('Dashboard')}>Back to Dashboard</Button>
                </Box>
              </Fade>
            )}


          </Box>
        </div>

        {/* Global Notifications */}
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ color: '#fff', width: '100%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* AI Email Resolution Modal */}
        <Modal
          open={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          aria-labelledby="email-draft-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        >
          <Fade in={isEmailModalOpen}>
            <Box sx={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 24,
              p: 4,
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              <Typography id="email-draft-title" variant="h5" sx={{ mb: 3, fontWeight: 700, className: "gradient-text" }}>
                AI Resolution Draft
              </Typography>

              <Box sx={{ background: 'rgba(15, 23, 42, 0.9)', p: 3, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 1 }}>Subject</Typography>
                  <IconButton onClick={() => copyToClipboard(emailDraft?.subject)} size="small" sx={{ color: '#94a3b8' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body1" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>{emailDraft?.subject}</Typography>

                <Divider sx={{ mb: 3, opacity: 0.1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 1 }}>Email Body</Typography>
                  <IconButton onClick={() => copyToClipboard(emailDraft?.body)} size="small" sx={{ color: '#94a3b8' }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body1" sx={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {emailDraft?.body}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsEmailModalOpen(false)} sx={{ color: '#94a3b8' }}>Close</Button>
                <Button
                  variant="contained"
                  onClick={() => copyToClipboard(`${emailDraft?.subject}\n\n${emailDraft?.body}`)}
                  sx={{ background: '#8b5cf6', borderRadius: '10px' }}
                >
                  Copy Full Draft
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

      </div >
    </ThemeProvider >
  );
}

export default App;