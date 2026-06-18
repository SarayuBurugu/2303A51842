import { useState, useEffect } from "react";
import {
  AppBar,
  Badge,
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import CampaignIcon from "@mui/icons-material/Campaign";
import ViewListIcon from "@mui/icons-material/ViewList";

import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";
import { SendNotificationPage } from "./pages/SendNotificationPage";
import { fetchAllNotifications, markNotificationAsRead } from "./api/notifications";
import createLogger from "./utils/logger";

const log = createLogger("App");

// Custom premium Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5", // Indigo
      light: "#818cf8",
      dark: "#3730a3",
    },
    secondary: {
      main: "#ec4899", // Pink
    },
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#475569", // Slate 600
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#0f172a",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          px: 3,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "none",
        },
      },
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [allNotifications, setAllNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dismissedPriorityIds, setDismissedPriorityIds] = useState(new Set());

  // Log initial mount
  useEffect(() => {
    log.info("App mounted");
  }, []);

  // Fetch all notifications (used for priority ranking and global unread badge)
  useEffect(() => {
    let cancelled = false;
    log.info("Fetching all notifications for global state", { refreshTrigger });

    const load = async () => {
      try {
        const notifs = await fetchAllNotifications();
        if (!cancelled) {
          setAllNotifications(notifs);
          log.info("Successfully fetched all notifications", { count: notifs.length });
        }
      } catch (err) {
        log.error("Failed to fetch all notifications globally", { error: err.message });
      }
    };

    load();
    return () => { cancelled = true; };
  }, [refreshTrigger]);

  const handleTabChange = (_event, newValue) => {
    log.info("Tab switched", { to: newValue });
    setActiveTab(newValue);
  };

  // Global mark as read handler
  const handleMarkReadGlobal = async (id) => {
    log.info("Global marking notification as read", { id });

    // Optimistic update of local state
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await markNotificationAsRead(id);
      log.info("Successfully marked notification as read in API", { id });
    } catch (err) {
      log.error("Failed to mark read in API, reverting local state", { id, error: err.message });
      // Revert if API failed
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    } finally {
      // Increment refresh trigger to reload All Notifications view page hook
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // Dismiss priority notification handler
  const handleDismissPriority = (id) => {
    log.info("Dismissing notification from priority list", { id });
    setDismissedPriorityIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });
  };

  // Trigger refetch of all notifications when a new one is sent
  const handleNotificationCreated = () => {
    log.info("New notification created, triggering global refresh");
    setRefreshTrigger((prev) => prev + 1);
  };

  // Calculate global unread count
  const globalUnreadCount = allNotifications.filter((n) => !n.read).length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
        {/* Navigation Bar */}
        <AppBar position="sticky" elevation={0}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Badge badgeContent={globalUnreadCount} color="error" max={99}>
                  <NotificationsIcon sx={{ color: "primary.main", fontSize: 32 }} />
                </Badge>
                <Typography variant="h6" fontWeight={800} color="text.primary">
                  Campus Notification Portal
                </Typography>
              </Box>

              {/* Navigation Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    minWidth: 100,
                  },
                }}
              >
                <Tab icon={<ViewListIcon />} iconPosition="start" label="All" />
                <Tab icon={<StarIcon />} iconPosition="start" label="Priority Inbox" />
                <Tab icon={<CampaignIcon />} iconPosition="start" label="Send Alert" />
              </Tabs>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Page Container */}
        <Container maxWidth="lg" sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <NotificationsPage refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 1 && (
            <PriorityNotificationsPage
              allNotifications={allNotifications}
              onMarkRead={handleMarkReadGlobal}
              dismissedIds={dismissedPriorityIds}
              onDismiss={handleDismissPriority}
            />
          )}
          {activeTab === 2 && (
            <SendNotificationPage onNotificationCreated={handleNotificationCreated} />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}