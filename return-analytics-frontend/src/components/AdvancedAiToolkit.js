import React, { useState, useEffect } from "react";
import {
    Box, Typography, Grid, TextField, Button,
    CircularProgress, Paper, Divider, Chip, Card, CardContent, IconButton, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, Fade, Backdrop,
    InputAdornment
} from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import InfoIcon from '@mui/icons-material/Info';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PsychologyIcon from '@mui/icons-material/Psychology';

import {
    draftResolutionEmail,
    createAction,
    getActions,
    updateActionStatus,
    getStrategicBriefing
} from "../services/api";

function AdvancedAiToolkit() {
    // Shared State
    const [emailDraft, setEmailDraft] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFlow, setActiveFlow] = useState(null); // 'customer' or 'warehouse'
    const [actions, setActions] = useState([]);
    const [isFetchingActions, setIsFetchingActions] = useState(false);

    // Briefing State
    const [isBriefingOpen, setIsBriefingOpen] = useState(false);
    const [briefingData, setBriefingData] = useState("");
    const [isBriefingLoading, setIsBriefingLoading] = useState(false);

    // Form inputs
    const [sku, setSku] = useState("");
    const [issue, setIssue] = useState("");
    const [action, setAction] = useState("");

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        setIsFetchingActions(true);
        try {
            const res = await getActions();
            setActions(res.data);
        } catch (err) {
            console.error("Failed to fetch actions", err);
        } finally {
            setIsFetchingActions(false);
        }
    };

    const generateResolution = async (type) => {
        if (!sku || !issue) return;
        setIsLoading(true);
        setEmailDraft(null);
        setActiveFlow(type);

        try {
            const res = await draftResolutionEmail({
                sku: sku,
                product: sku, // Using SKU as product name for now
                issue: issue,
                action: type === 'warehouse' ? `HALT SALES & INSPECT BATCH: ${action || 'Immediate investigation required'}` : action,
                recipient_type: type
            });
            setEmailDraft(res.data);
        } catch (err) {
            console.error(err);
            setEmailDraft({
                subject: "Service Error",
                body: "Failed to connect to the AI resolution engine. Please ensure the backend is running."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToTracker = async () => {
        if (!emailDraft || !sku) return;
        try {
            await createAction({
                sku: sku,
                recipient_type: activeFlow,
                action_type: activeFlow === 'warehouse' ? 'Halt' : 'Email',
                content: emailDraft.body,
                status: 'Draft'
            });
            fetchActions();
            setEmailDraft(null);
            setSku("");
            setIssue("");
            setAction("");
        } catch (err) {
            console.error("Failed to save action", err);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateActionStatus(id, newStatus);
            fetchActions();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleGenerateBriefing = async () => {
        setIsBriefingOpen(true);
        setIsBriefingLoading(true);
        try {
            const res = await getStrategicBriefing();
            setBriefingData(res.data.briefing);
        } catch (err) {
            console.error("Briefing failed", err);
            setBriefingData("Failed to generate strategic briefing. Please check backend services.");
        } finally {
            setIsBriefingLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Box sx={{ width: '100%', pb: 10 }}>
            {/* Header */}
            <Box sx={{ px: { xs: 2, md: 5 }, mb: 5, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SecurityIcon sx={{ fontSize: 48, color: '#8b5cf6', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' }} />
                    <Box>
                        <Typography variant="h3" className="gradient-text" sx={{ fontWeight: 800, mb: 1 }}>Strategic Resolution Center</Typography>
                        <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.7, fontWeight: 400 }}>
                            Deploy AI-powered interventions across customer service and warehouse operations.
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DescriptionIcon />}
                    className="glow-button"
                    onClick={handleGenerateBriefing}
                    sx={{ py: 2, px: 4, borderRadius: '16px', fontWeight: 800 }}
                >
                    Generate Strategic Briefing
                </Button>
            </Box>

            <Box sx={{ px: { xs: 2, md: 5 } }}>
                <Grid container spacing={4} alignItems="stretch">
                    {/* Input Panel */}
                    <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
                        <Paper className="glass-card" sx={{ p: 4, width: '100%', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 700 }}>Resolution Parameters</Typography>

                            <TextField
                                fullWidth
                                label="Product SKU / ID"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="e.g. SKU-8812"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FingerprintIcon sx={{ color: '#8b5cf6', opacity: 0.7 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Identified Issue"
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                placeholder="e.g. Sole adhesion failure reported by 15 customers."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                                            <InfoIcon sx={{ color: '#8b5cf6', opacity: 0.7 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Desired Action / Fix"
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                placeholder="e.g. Full refund or Warehouse Inspection"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <HandshakeIcon sx={{ color: '#8b5cf6', opacity: 0.7 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 4 }}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<EmailIcon />}
                                        onClick={() => generateResolution('customer')}
                                        disabled={isLoading || !sku || !issue}
                                        sx={{ py: 1.5, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', '&:hover': { background: 'rgba(59, 130, 246, 0.3)' } }}
                                    >
                                        Customer Draft
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<WarehouseIcon />}
                                        onClick={() => generateResolution('warehouse')}
                                        disabled={isLoading || !sku || !issue}
                                        sx={{ py: 1.5, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.3)' } }}
                                    >
                                        Warehouse Halt
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Output Panel/Draft Preview */}
                    <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
                        <Paper className="glass-card" sx={{ p: 0, width: '100%', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 3, background: 'rgba(139, 92, 246, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesomeIcon sx={{ color: '#8b5cf6' }} /> AI Draft Preview
                                </Typography>
                                {emailDraft && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSaveToTracker}
                                        sx={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                                    >
                                        Save to Tracker
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                {isLoading ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                                        <CircularProgress color="primary" />
                                        <Typography variant="body2" color="textSecondary">Synthesizing {activeFlow} resolution...</Typography>
                                    </Box>
                                ) : emailDraft ? (
                                    <Box>
                                        <Box sx={{ mb: 3, p: 2, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}><b>Subject:</b> {emailDraft.subject}</Typography>
                                            <IconButton size="small" onClick={() => copyToClipboard(emailDraft.subject)} sx={{ color: '#8b5cf6' }}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ position: 'relative' }}>
                                            <Box sx={{
                                                p: 3,
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '12px',
                                                minHeight: '200px',
                                                whiteSpace: 'pre-wrap',
                                                color: '#e2e8f0',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.6
                                            }}>
                                                {emailDraft.body}
                                            </Box>
                                            <Button
                                                startIcon={<ContentCopyIcon />}
                                                onClick={() => copyToClipboard(emailDraft.body)}
                                                sx={{ position: 'absolute', bottom: 12, right: 12, textTransform: 'none', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
                                            >
                                                Copy Body
                                            </Button>
                                        </Box>

                                        <Alert icon={<SecurityIcon />} severity="info" sx={{ mt: 3, background: 'rgba(139, 92, 246, 0.1)', color: '#fff', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                            Review this draft for brand alignment before sending.
                                        </Alert>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', opacity: 0.5, textAlign: 'center' }}>
                                        <PsychologyIcon sx={{ fontSize: 64, mb: 2, color: '#94a3b8' }} />
                                        <Typography variant="body1" color="textSecondary" sx={{ fontStyle: 'italic', maxWidth: '300px' }}>
                                            Select a recipient type to generate a data-backed resolution draft with our AI engine.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Action Tracker Table - Explicitly placed below with margin */}
                <Box sx={{ mt: 6 }}>
                    <Paper className="glass-card" sx={{ p: 4, borderRadius: '24px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>Integrated Action Tracker</Typography>
                            <IconButton onClick={fetchActions} disabled={isFetchingActions} sx={{ color: '#3b82f6' }}>
                                <RefreshIcon />
                            </IconButton>
                        </Box>

                        <TableContainer sx={{ background: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>SKU</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action Type</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Recipient</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Created</TableCell>
                                        <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Operations</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {actions.length > 0 ? actions.map((row) => (
                                        <TableRow key={row.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.03)', '&:hover': { background: 'rgba(255,255,255,0.01)' } }}>
                                            <TableCell sx={{ color: '#fff', fontWeight: 600 }}>{row.sku}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.action_type}
                                                    size="small"
                                                    icon={row.action_type === 'Email' ? <EmailIcon /> : <WarehouseIcon />}
                                                    sx={{ background: row.action_type === 'Email' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: row.action_type === 'Email' ? '#3b82f6' : '#ef4444' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#cbd5e1' }}>{row.recipient_type}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: row.status === 'Resolved' ? '#10b981' : row.status === 'Sent' ? '#3b82f6' : '#94a3b8',
                                                        color: row.status === 'Resolved' ? '#10b981' : row.status === 'Sent' ? '#3b82f6' : '#94a3b8'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                {new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.status === 'Draft' && (
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(row.id, 'Sent')}
                                                        sx={{ color: '#3b82f6', textTransform: 'none' }}
                                                    >
                                                        Mark Sent
                                                    </Button>
                                                )}
                                                {row.status === 'Sent' && (
                                                    <Button
                                                        size="small"
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => handleStatusUpdate(row.id, 'Resolved')}
                                                        sx={{ color: '#10b981', textTransform: 'none' }}
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                                {row.status === 'Resolved' && (
                                                    <Typography variant="caption" sx={{ color: '#10b981' }}>Complete</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                                                No tracked actions found. Deploy a resolution to start tracking.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Box>

            {/* Strategic Briefing Modal */}
            <Modal
                open={isBriefingOpen}
                onClose={() => setIsBriefingOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                }}
            >
                <Fade in={isBriefingOpen}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', md: '800px' },
                        maxHeight: '80vh',
                        bgcolor: '#0f172a',
                        borderRadius: '24px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)',
                        p: 4,
                        overflowY: 'auto'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h4" className="gradient-text" sx={{ fontWeight: 800 }}>Weekly Strategic Briefing</Typography>
                            <IconButton onClick={() => setIsBriefingOpen(false)} sx={{ color: '#94a3b8' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        <Divider sx={{ mb: 4, opacity: 0.1 }} />

                        {isBriefingLoading ? (
                            <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <CircularProgress thickness={2} size={60} sx={{ color: '#8b5cf6' }} />
                                <Typography variant="h6" sx={{ color: '#94a3b8' }}>Synthesizing operational intelligence...</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ color: '#e2e8f0', lineHeight: 1.8 }}>
                                <Box sx={{
                                    p: 3,
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(139, 92, 246, 0.1)',
                                    mb: 4
                                }}>
                                    <Typography variant="overline" sx={{ color: '#c084fc', fontWeight: 800 }}>Intelligence Summary</Typography>
                                    <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                        {briefingData}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                                    <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copyToClipboard(briefingData)} sx={{ color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                                        Copy Briefing
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}

export default AdvancedAiToolkit;
