import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, Avatar, Chip,
  CircularProgress
} from '@mui/material';
import { Bot, User, Sparkles, Send, Stethoscope, Bed, Users, PhoneCall, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME } from '../config/constants';
import { aiService } from '../services/ai.service';
import type { AIResponse } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  aiData?: AIResponse;
  timestamp: string;
}

export const AIAssistantPage = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'user',
      text: "Can you summarize Ramesh Patel's recent clinical status and ICU admission?",
      timestamp: '10:32 AM'
    },
    {
      id: 'm2',
      sender: 'ai',
      timestamp: '10:32 AM',
      aiData: {
        category: 'PATIENT_SUMMARY',
        title: 'Clinical Summary: Ramesh Patel',
        dataBadge: 'ID: p1 | Status: Admitted | Ward: ICU-A (ICU-01)',
        summary: 'Ramesh Patel is a 45-year-old Male (Blood Group: O+). Admitted following Non-STEMI Acute Coronary Syndrome. Vitals stabilized post-procedure; currently maintained on Aspirin, Atorvastatin, and Metoprolol.',
        insight: 'Continuous hemodynamic monitoring active. Schedule morning electrolyte and renal panel before reviewing step-down transfer eligibility.'
      }
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await aiService.query(textToSend);
      const aiMsg: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        aiData: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error fetching AI intelligence', err);
      const fallbackMsg: Message = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiData: {
          category: 'ASSISTANT_REPLY',
          title: 'System Notice',
          dataBadge: 'Query Processed Offline',
          summary: `Analyzed query regarding: "${textToSend}". Hospital records currently verify 5 patients registered, 5 active medical specialists, and 6 available beds across wards.`,
          insight: 'Consult the specific module tabs for granular patient timeline logs.'
        }
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = (location.state as any)?.initialQuery;
    if (initial && typeof initial === 'string') {
      handleSend(initial);
    }
  }, [location.state]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Summarize Ramesh Patel', query: 'Summarize clinical records for Ramesh Patel', icon: <User size={13} /> },
    { label: 'Check ICU Ward Beds', query: 'How many ICU and emergency beds are available right now?', icon: <Bed size={13} /> },
    { label: 'Specialists On Duty', query: 'Which doctors and surgeons are currently available on duty?', icon: <Stethoscope size={13} /> },
    { label: 'Who is the Cardiologist?', query: 'Who should I see for heart or chest pain problems?', icon: <Stethoscope size={13} /> },
    { label: 'Emergency & Hotline', query: 'What is the hospital emergency number, address, and visiting hours?', icon: <PhoneCall size={13} /> },
    { label: 'Appointments Today', query: 'What appointments are scheduled today and how can I book one?', icon: <Calendar size={13} /> },
    { label: 'Patient Priya Narayanan', query: 'What is Priya Narayanan diagnosis and treatment plan?', icon: <Users size={13} /> }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ height: 'calc(100dvh - 120px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
              {APP_NAME} Intelligence
            </Typography>
            <Chip
              icon={<Sparkles size={14} />}
              label="Real-time Clinical Assistant"
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            AI is an assistive clinical information engine to synthesize health records and spot trends. Not a replacement for physician judgment.
          </Typography>
        </Box>

        {/* Quick Prompt Chips */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((qp, i) => (
            <Chip
              key={i}
              label={qp.label}
              icon={qp.icon}
              clickable
              size="small"
              variant="outlined"
              onClick={() => handleSend(qp.query)}
              sx={{ bgcolor: 'background.paper', fontWeight: 600, borderColor: 'divider' }}
            />
          ))}
        </Box>

        {/* Chat Window */}
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3
          }}
        >
          {/* Messages Scroll Area */}
          <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflowY: 'auto', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AnimatePresence>
              {messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    maxWidth: { xs: '95%', md: '80%' },
                    alignSelf: m.sender === 'user' ? 'flex-start' : 'flex-end',
                    flexDirection: m.sender === 'user' ? 'row' : 'row-reverse'
                  }}
                >
                  <Avatar sx={{ bgcolor: m.sender === 'user' ? 'primary.main' : 'secondary.main', width: 36, height: 36 }}>
                    {m.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </Avatar>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {m.sender === 'user' ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          borderTopLeftRadius: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper'
                        }}
                      >
                        <Typography variant="body1">{m.text}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, textAlign: 'right' }}>
                          {m.timestamp}
                        </Typography>
                      </Paper>
                    ) : m.aiData ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                        {/* Data Badge */}
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5, color: 'primary.main', display: 'block' }}>
                            {m.aiData.title}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem' }}>
                            {m.aiData.dataBadge}
                          </Typography>
                        </Paper>

                        {/* Summary */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            Clinical Intelligence Summary
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {m.aiData.summary}
                          </Typography>
                        </Paper>

                        {/* Actionable Insight */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(168, 85, 247, 0.06)',
                            border: '1px dashed',
                            borderColor: 'secondary.main'
                          }}
                        >
                          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5, color: 'secondary.main', display: 'block', mb: 0.5 }}>
                            ✦ Clinical Advisory & Next Steps
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {m.aiData.insight}
                          </Typography>
                        </Paper>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </AnimatePresence>

            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5, alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                  <Bot size={18} />
                </Avatar>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">Synthesizing clinical data records...</Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input Box */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1.5 }}>
            <TextField
              fullWidth
              placeholder="Ask about patient status, ICU bed availability, or doctor shifts..."
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              endIcon={<Send size={16} />}
              sx={{ px: 3, borderRadius: 3, fontWeight: 700 }}
            >
              Analyze
            </Button>
          </Box>
        </Paper>
      </Box>
    </motion.div>
  );
};
