import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  CardMembership,
  Star,
  Check,
  CreditCard,
  Diamond,
  Workspace,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const Membership = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const membershipPlans = [
    {
      id: "basic",
      name: "Basic",
      duration: "6 months",
      price: 299,
      icon: <CardMembership sx={{ fontSize: 40 }} />,
      color: "primary",
      features: [
        "Create up to 5 events",
        "Basic event analytics",
        "Email support",
        "Standard templates",
        "Mobile app access",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      duration: "1 year",
      price: 599,
      icon: <Star sx={{ fontSize: 40 }} />,
      color: "secondary",
      features: [
        "Create unlimited events",
        "Advanced analytics & reports",
        "Priority email & chat support",
        "Premium templates & themes",
        "Mobile app access",
        "Social media integration",
        "Custom branding",
        "Advanced registration forms",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      duration: "2 years",
      price: 999,
      icon: <Diamond sx={{ fontSize: 40 }} />,
      color: "warning",
      features: [
        "Everything in Premium",
        "White-label solution",
        "API access",
        "Dedicated account manager",
        "Phone support",
        "Custom integrations",
        "Advanced security features",
        "Multi-team collaboration",
        "Custom reporting",
      ],
      popular: false,
    },
  ];

  useEffect(() => {
    fetchCurrentMembership();
  }, []);

  const fetchCurrentMembership = async () => {
    try {
      const response = await api.get("/memberships/current");
      setCurrentMembership(response.data);
    } catch (error) {
      console.error("Error fetching membership:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (plan) => {
    setSelectedPlan(plan);
    setPurchaseDialog(true);
    setError("");
    setSuccess("");
  };

  const processPurchase = async () => {
    setPaymentLoading(true);
    setError("");

    try {
      const response = await api.post("/memberships/purchase", {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        duration: selectedPlan.duration,
        amount: selectedPlan.price,
      });

      setSuccess("Membership purchased successfully!");
      setPurchaseDialog(false);
      fetchCurrentMembership();
    } catch (error) {
      setError(
        error.response?.data?.message || "Purchase failed. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" mb={4}>
          <CardMembership sx={{ fontSize: 40, mr: 2, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Membership Plans
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {currentMembership && (
          <Card
            sx={{
              mb: 4,
              bgcolor: "success.light",
              color: "success.contrastText",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Membership
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Plan:</strong> {currentMembership.planName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status:</strong> {currentMembership.status}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Started:</strong>{" "}
                    {formatDate(currentMembership.startDate)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Expires:</strong>{" "}
                    {formatDate(currentMembership.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Choose Your Plan
        </Typography>

        <Grid container spacing={3}>
          {membershipPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    border: plan.popular ? "2px solid" : "1px solid",
                    borderColor: plan.popular ? "secondary.main" : "divider",
                    transform: plan.popular ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: plan.popular ? "scale(1.08)" : "scale(1.03)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="secondary"
                      sx={{
                        position: "absolute",
                        top: -10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1,
                      }}
                    />
                  )}

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: "center",
                      pt: plan.popular ? 4 : 2,
                    }}
                  >
                    <Box sx={{ color: `${plan.color}.main`, mb: 2 }}>
                      {plan.icon}
                    </Box>

                    <Typography
                      variant="h5"
                      component="h2"
                      gutterBottom
                      fontWeight="bold"
                    >
                      {plan.name}
                    </Typography>

                    <Typography
                      variant="h3"
                      component="div"
                      color="primary"
                      fontWeight="bold"
                    >
                      ₹{plan.price}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {plan.duration}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: "left" }}>
                      {plan.features.map((feature, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Check
                            sx={{ color: "success.main", mr: 1, fontSize: 20 }}
                          />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant={plan.popular ? "contained" : "outlined"}
                      color={plan.color}
                      size="large"
                      startIcon={<CreditCard />}
                      onClick={() => handlePurchase(plan)}
                      disabled={currentMembership?.status === "active"}
                    >
                      {currentMembership?.status === "active"
                        ? "Current Plan"
                        : "Purchase Plan"}
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Purchase Dialog */}
        <Dialog
          open={purchaseDialog}
          onClose={() => setPurchaseDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Purchase {selectedPlan?.name} Plan</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Plan Details
              </Typography>
              <Typography variant="body1">
                <strong>Plan:</strong> {selectedPlan?.name}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> {selectedPlan?.duration}
              </Typography>
              <Typography variant="body1">
                <strong>Amount:</strong> ₹{selectedPlan?.price}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <TextField
              fullWidth
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <CreditCard sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  margin="normal"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Cardholder Name"
              placeholder="John Doe"
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPurchaseDialog(false)}>Cancel</Button>
            <Button
              onClick={processPurchase}
              variant="contained"
              disabled={paymentLoading}
              startIcon={
                paymentLoading ? <CircularProgress size={20} /> : <CreditCard />
              }
            >
              {paymentLoading ? "Processing..." : `Pay ₹${selectedPlan?.price}`}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Membership;
