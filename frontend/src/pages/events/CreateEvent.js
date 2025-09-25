import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import { CloudUpload, Add, Close } from "@mui/icons-material";
import { motion } from "framer-motion";

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: new Date(),
    endDate: new Date(),
    venue: "",
    address: "",
    capacity: "",
    price: "",
    image: null,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "Technology",
    "Business",
    "Education",
    "Entertainment",
    "Sports",
    "Health",
    "Arts",
    "Music",
    "Networking",
    "Workshop",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Here you would make an API call to create the event
      // const response = await api.post('/events', formData);

      setSuccess("Event created successfully!");
      // Reset form or redirect
      setTimeout(() => {
        // window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Create New Event
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Fill in the details to create your event.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Event Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>

              {/* Category and Capacity */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Date and Time */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date & Time"
                  name="date"
                  type="datetime-local"
                  value={
                    formData.date
                      ? formData.date.toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleDateChange("date", new Date(e.target.value))
                  }
                  required
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date & Time"
                  name="endDate"
                  type="datetime-local"
                  value={
                    formData.endDate
                      ? formData.endDate.toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleDateChange("endDate", new Date(e.target.value))
                  }
                  required
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Venue */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Venue Name"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ticket Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  variant="outlined"
                  helperText="Enter 0 for free events"
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12} md={6}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Upload Event Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.image && (
                  <Typography variant="caption" color="success.main">
                    Image selected: {formData.image.name}
                  </Typography>
                )}
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Add Tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleAddTag}>
                          <Add />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      deleteIcon={<Close />}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2, py: 1.5 }}
                >
                  Create Event
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CreateEvent;
