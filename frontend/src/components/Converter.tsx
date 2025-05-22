import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, FormControl, RadioGroup, FormControlLabel, Radio, CircularProgress, Snackbar, Alert, Container, Chip, Tooltip, IconButton, Divider, useMediaQuery, useTheme, Card, CardContent } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import TranslateIcon from '@mui/icons-material/Translate';
import HistoryIcon from '@mui/icons-material/History';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import axios from 'axios';

const exampleQueries = [
  'Show all users who registered in the last 30 days',
  'Find products with price greater than $100 and are in stock',
  'Count the number of orders grouped by status',
  'Get the average age of users from New York',
  'List customers who made purchases in the last quarter',
  'Find transactions with amount greater than average'
];

// Database schema hints to help users formulate better queries
const schemaHints = [
  { table: 'users', fields: ['id', 'name', 'email', 'age', 'location', 'registration_date'] },
  { table: 'products', fields: ['id', 'name', 'price', 'category', 'in_stock', 'created_at'] },
  { table: 'orders', fields: ['id', 'user_id', 'total', 'status', 'created_at'] },
  { table: 'transactions', fields: ['id', 'order_id', 'amount', 'payment_method', 'status'] }
];

const Converter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputQuery, setOutputQuery] = useState('');
  const [format, setFormat] = useState('sql');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [queryHistory, setQueryHistory] = useState<{text: string, format: string, result: string}[]>([]);
  
  // For responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Save query history to local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing saved history:', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('queryHistory', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setOutputQuery('');
    setCopied(false);

    try {
      const response = await axios.post('http://localhost:5000/api/convert', {
        text: inputText,
        format
      });

      const result = response.data.query;
      setOutputQuery(result);
      
      // Add to history (limit to last 10 queries)
      setQueryHistory(prev => [
        { text: inputText, format, result },
        ...prev.slice(0, 9)
      ]);
    } catch (err: any) {
      console.error('Error converting text:', err);
      
      // Provide more specific error messages based on the error type
      if (err.response) {
        if (err.response.status === 401) {
          setError('API authentication error. Please check the API key configuration.');
        } else if (err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('No response from server. Please check if the API server is running.');
      } else {
        setError('Failed to convert text. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInputText(example);
  };

  const handleCopyClick = () => {
    if (outputQuery) {
      navigator.clipboard.writeText(outputQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleHistoryItemClick = (item: {text: string, format: string, result: string}) => {
    setInputText(item.text);
    setFormat(item.format);
    setOutputQuery(item.result);
  };

  const toggleHints = () => {
    setShowHints(!showHints);
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: isMobile ? 2 : 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      position: 'relative',
      zIndex: 1,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -20,
        left: -20,
        right: -20,
        bottom: -20,
        background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }
    }}>
      <Box sx={{
        textAlign: 'center',
        p: isMobile ? 3 : 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(33,150,243,0.15) 100%)',
        boxShadow: '0 8px 32px rgba(33,150,243,0.08)',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(33,150,243,0.12)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)',
          opacity: 0.6,
          zIndex: 0,
          animation: 'pulse 15s infinite',
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <TranslateIcon sx={{ mr: 1, color: '#1976d2', fontSize: 28 }} />
            <Typography variant="subtitle1" color="primary.main" fontWeight={500} gutterBottom>
              Translate natural language into database queries
            </Typography>
          </Box>
          
          <Typography variant="h3" component="h1" gutterBottom sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #1565C0 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(33,150,243,0.2)',
            letterSpacing: '-0.5px',
            fontSize: isMobile ? '2rem' : '2.5rem'
          }}>
            Text to <span style={{ color: '#2196f3' }}>Query</span> Converter
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ 
            maxWidth: 700, 
            mx: 'auto', 
            mb: 3,
            lineHeight: 1.6,
            fontSize: '1.05rem'
          }}>
            Convert plain English text into SQL, MongoDB, and other database queries
            using state-of-the-art AI technology. Perfect for developers, analysts, and database professionals.
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
            <Chip 
              icon={<CodeIcon fontSize="small" />} 
              label="SQL" 
              color="primary" 
              variant="outlined" 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              icon={<CodeIcon fontSize="small" />} 
              label="MongoDB" 
              color="primary" 
              variant="outlined" 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 3,
        width: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -10,
          left: 20,
          right: 20,
          height: 20,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0))',
          borderRadius: '50%',
          filter: 'blur(8px)',
          zIndex: -1
        }
      }}>
        <Paper elevation={3} sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(33,150,243,0.08)',
          transition: 'all 0.3s ease',
          flex: 3,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(33,150,243,0.12)'
          }
        }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{
                fontWeight: 600,
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TranslateIcon fontSize="small" sx={{ color: '#1976d2' }} />
                English Text Query
              </Typography>
            </Box>
            
            <Tooltip title="Show database schema hints">
              <IconButton 
                size="small" 
                color="primary" 
                onClick={toggleHints}
                sx={{ 
                  backgroundColor: showHints ? 'rgba(33,150,243,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(33,150,243,0.2)' }
                }}
              >
                <LightbulbIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter a description of the query you want to create in plain English
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., Find all active users from New York who registered in the last month"
            variant="outlined"
            sx={{
              mb: 3,
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.3s ease',
                fontSize: '1rem',
                '&:hover': {
                  boxShadow: '0 0 0 2px rgba(33,150,243,0.1)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(33,150,243,0.2)'
                }
              }
            }}
          />
          
          {showHints && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'rgba(33,150,243,0.05)', 
              border: '1px dashed rgba(33,150,243,0.3)' 
            }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Available Database Schema
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {schemaHints.map((schema, index) => (
                  <Box key={index}>
                    <Typography variant="body2" fontWeight={500} color="text.primary">
                      {schema.table}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                      {schema.fields.map((field, fieldIndex) => (
                        <Chip 
                          key={fieldIndex} 
                          label={field} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem', 
                            height: 22, 
                            backgroundColor: 'rgba(255,255,255,0.7)' 
                          }} 
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Use these table and field names in your query description for better results
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LightbulbIcon fontSize="small" sx={{ color: '#f9a825', fontSize: 18 }} />
              Example queries:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {exampleQueries.map((example, index) => (
                <Button 
                  key={index} 
                  size="small" 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: '20px', 
                    textTransform: 'none',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.85rem',
                    borderColor: '#e0e0e0',
                    background: 'linear-gradient(135deg, rgba(33,150,243,0.02) 0%, rgba(33,150,243,0.05) 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#2196f3',
                      background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.15) 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(33,150,243,0.15)'
                    }
                  }}
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Button>
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CodeIcon fontSize="small" sx={{ fontSize: 18 }} />
              Output Format:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              p: 1.5, 
              borderRadius: 2, 
              backgroundColor: 'rgba(0,0,0,0.02)' 
            }}>
              <FormControl component="fieldset">
                <RadioGroup 
                  row 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <FormControlLabel 
                    value="sql" 
                    control={<Radio sx={{ color: '#2196f3', '&.Mui-checked': { color: '#2196f3' } }} />} 
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label="SQL" 
                        size="small" 
                        sx={{ 
                          backgroundColor: format === 'sql' ? '#bbdefb' : 'transparent',
                          fontWeight: 500,
                          border: '1px solid #90caf9'
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        (MySQL, PostgreSQL, etc.)
                      </Typography>
                    </Box>} 
                  />
                  <FormControlLabel 
                    value="mongodb" 
                    control={<Radio sx={{ color: '#2196f3', '&.Mui-checked': { color: '#2196f3' } }} />} 
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Chip 
                        label="MongoDB" 
                        size="small" 
                        sx={{ 
                          backgroundColor: format === 'mongodb' ? '#bbdefb' : 'transparent',
                          fontWeight: 500,
                          border: '1px solid #90caf9'
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        (NoSQL)
                      </Typography>
                    </Box>} 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ 
              borderRadius: '8px', 
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 4px 15px rgba(33,150,243,0.3)',
              transition: 'all 0.3s ease',
              mt: 'auto',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565C0 0%, #1976d2 100%)',
                boxShadow: '0 6px 20px rgba(33,150,243,0.4)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                background: 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)',
                opacity: 0.7
              }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TranslateIcon />}
            endIcon={!loading ? <CodeIcon /> : null}
            fullWidth 
            disabled={loading || !inputText.trim()}
          >
            {loading ? 'Converting...' : `Convert to ${format.toUpperCase()}`}
          </Button>
        </form>
      </Paper>
      
      {/* Query history panel - only visible on desktop */}
      {!isMobile && queryHistory.length > 0 && (
        <Paper elevation={2} sx={{
          p: 3,
          borderRadius: 3,
          flex: 1,
          maxWidth: 300,
          height: 'fit-content',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(0,0,0,0.12)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <HistoryIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Recent Queries
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {queryHistory.map((item, index) => (
              <Card 
                key={index} 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(33,150,243,0.05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                  }
                }}
                onClick={() => handleHistoryItemClick(item)}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" noWrap title={item.text}>
                    {item.text.length > 40 ? item.text.substring(0, 40) + '...' : item.text}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Chip 
                      label={item.format.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        backgroundColor: item.format === 'sql' ? '#e3f2fd' : '#e8f5e9',
                        fontWeight: 500
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
      </Box>
      
      {outputQuery && (
        <Paper elevation={3} sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(33,150,243,0.08)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(33,150,243,0.12)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -10,
            left: 20,
            right: 20,
            height: 20,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0))',
            borderRadius: '50%',
            filter: 'blur(8px)',
            zIndex: -1
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6px',
            height: '100%',
            background: 'linear-gradient(to bottom, #1976d2, #42a5f5)',
            borderTopLeftRadius: 3,
            borderBottomLeftRadius: 3
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon color="primary" />
              <Typography variant="h6" sx={{
                fontWeight: 600,
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Generated {format.toUpperCase()} Query
              </Typography>
            </Box>
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<ContentCopyIcon fontSize="small" />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: copied ? '#4caf50' : '#90caf9',
                  color: copied ? '#4caf50' : '#1976d2',
                  background: copied 
                    ? 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(76,175,80,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(33,150,243,0.05) 0%, rgba(33,150,243,0.1) 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: copied ? '#4caf50' : '#2196f3',
                    background: copied
                      ? 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.2) 100%)'
                      : 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.2) 100%)',
                    boxShadow: '0 4px 12px rgba(33,150,243,0.15)'
                  }
                }}
                onClick={handleCopyClick}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Tooltip>
          </Box>
          <Box 
            sx={{ 
              p: 3, 
              backgroundColor: format === 'sql' ? 'rgba(25, 118, 210, 0.03)' : 'rgba(56, 142, 60, 0.03)', 
              borderRadius: 2,
              fontFamily: '"Fira Code", "Roboto Mono", monospace',
              fontSize: '0.95rem',
              fontWeight: 500,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
              border: `1px solid ${format === 'sql' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(56, 142, 60, 0.1)'}`,
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': {
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                backgroundColor: format === 'sql' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(56, 142, 60, 0.1)', 
                color: format === 'sql' ? '#1976d2' : '#388e3c',
                px: 1.5,
                py: 0.5,
                borderBottomLeftRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: '"Roboto", sans-serif',
              }}
            >
              {format.toUpperCase()}
            </Box>
            {outputQuery}
          </Box>
        </Paper>
      )}
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          variant="filled"
          sx={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 2,
            width: '100%'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={copied} 
        autoHideDuration={2000} 
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 2 
          }}
        >
          Query copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Converter;