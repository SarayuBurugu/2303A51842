import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CampaignIcon from "@mui/icons-material/Campaign";

import { createNotification } from "../api/notifications";
import createLogger from "../utils/logger";

const log = createLogger("SendNotificationPage");

export function SendNotificationPage({ onNotificationCreated }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Placement");

  // Validation & Touched state
  const [touched, setTouched] = useState({ title: false, message: false });

  // Loading & Toast Feedback
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    log.info("Page mounted");
  }, []);

  // Derive validation errors directly during render
  const errors = { title: "", message: "" };

  if (touched.title) {
    if (!title.trim()) {
      errors.title = "Title is required";
    } else if (title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }
  }

  if (touched.message) {
    if (!message.trim()) {
      errors.message = "Message is required";
    } else if (message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleToastClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched to trigger validation checks
    setTouched({ title: true, message: true });

    const titleValid = title.trim().length >= 5;
    const messageValid = message.trim().length >= 10;

    if (!titleValid || !messageValid) {
      log.warn("Form validation failed on submit", {
        titleLength: title.length,
        messageLength: message.length,
      });
      return;
    }

    log.info("Form submission started", { title, type });
    setSubmitting(true);

    try {
      const result = await createNotification({
        title: title.trim(),
        message: message.trim(),
        type,
      });

      log.info("Form submission succeeded", { id: result.id });
      setToast({
        open: true,
        message: `Notification "${result.title}" created successfully!`,
        severity: "success",
      });

      // Reset form
      setTitle("");
      setMessage("");
      setType("Placement");
      setTouched({ title: false, message: false });

      // Trigger global refetch / update
      if (onNotificationCreated) {
        onNotificationCreated();
      }
    } catch (err) {
      log.error("Form submission failed", { error: err.message });
      setToast({
        open: true,
        message: `Failed to create notification: ${err.message}`,
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <CampaignIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Send Notification
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Broadcast a new alert to all students in the portal.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, boxShadow: 1 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Title Field */}
            <TextField
              label="Notification Title"
              required
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur("title")}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              placeholder="e.g., Google SDE-1 Hiring Drive"
              disabled={submitting}
            />

            {/* Notification Type Dropdown */}
            <FormControl fullWidth required disabled={submitting}>
              <InputLabel id="notification-type-label">Notification Type</InputLabel>
              <Select
                labelId="notification-type-label"
                id="notification-type-select"
                value={type}
                label="Notification Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="Placement">💼 Placement</MenuItem>
                <MenuItem value="Result">📊 Result</MenuItem>
                <MenuItem value="Event">📅 Event</MenuItem>
              </Select>
              <FormHelperText>Select the category of the notification</FormHelperText>
            </FormControl>

            {/* Message Field */}
            <TextField
              label="Notification Message"
              required
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => handleBlur("message")}
              error={touched.message && Boolean(errors.message)}
              helperText={touched.message && errors.message}
              placeholder="Provide all details including eligibility, dates, and action links..."
              disabled={submitting}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SendIcon />}
              loading={submitting}
              sx={{
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              Send Notification
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Toast Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
