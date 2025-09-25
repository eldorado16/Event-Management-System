import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Email,
  Lock,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await forgotPassword(data.email);
    
    if (result.success) {
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email!');
    } else {
      toast.error(result.error || 'Failed to send reset email');
    }
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={10}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Lock sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
              <Typography component="h1" variant="h4" fontWeight="bold">
                Forgot Password
              </Typography>
            </Box>

            {!isSubmitted ? (
              <>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ width: '100%' }}
                >
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register('email')}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                    disabled={isLoading}
                    size="large"
                  >
                    {isLoading ? <LoadingSpinner size={24} /> : 'Send Reset Link'}
                  </Button>
                </Box>
              </>
            ) : (
              <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Email Sent!
                </Typography>
                <Typography variant="body2">
                  We've sent password reset instructions to your email address. 
                  Please check your inbox and follow the instructions to reset your password.
                </Typography>
              </Alert>
            )}

            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                color="primary"
              >
                Back to Login
              </Link>
              <Typography variant="body2" color="text.secondary">
                |
              </Typography>
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                color="primary"
              >
                Create Account
              </Link>
            </Box>

            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 3 }}>
              Remember your password? Go back to login and sign in.
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ForgotPassword;