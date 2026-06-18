import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import InboxIcon from "@mui/icons-material/Inbox";

import { getTopK } from "../utils/priorityQueue";
import createLogger from "../utils/logger";

const log = createLogger("PriorityNotificationsPage");

// Helper for ranking badge colors
const getRankBadgeStyles = (rank) => {
  if (rank === 1) {
    return {
      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
    };
  }
  if (rank === 2) {
    return {
      background: "linear-gradient(135deg, #C0C0C0 0%, #808080 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(192, 192, 192, 0.4)",
    };
  }
  if (rank === 3) {
    return {
      background: "linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(205, 127, 50, 0.4)",
    };
  }
  return {
    background: "#f0f2f5",
    color: "#4e5d78",
  };
};

export function PriorityNotificationsPage({
  allNotifications = [],
  onMarkRead,
  dismissedIds = new Set(),
  onDismiss,
}) {
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    log.info("Page mounted");
  }, []);

  // Compute the top 10 ranked notifications directly during render
  const rankedList = useMemo(() => {
    const activeNotifs = allNotifications.filter((n) => !dismissedIds.has(n.id));
    const top10 = getTopK(activeNotifs, 10);
    log.info("Priority notifications recalculated", { count: top10.length });
    return top10;
  }, [allNotifications, dismissedIds]);

  const handleOpenDetails = (notif) => {
    log.info("Viewing notification details", { id: notif.id });
    setSelectedNotif(notif);
  };

  const handleCloseDetails = () => {
    setSelectedNotif(null);
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    log.info("Dismissing priority notification", { id });
    onDismiss(id);
  };

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    log.info("Marking priority notification as read", { id });
    onMarkRead(id);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <StarIcon sx={{ fontSize: 32, color: "#FFA500" }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Priority Inbox (Top 10)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ranked using a client-side Max Heap based on notification type and recency.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {rankedList.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.01)",
          }}
        >
          <InboxIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No high priority items
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            You've dismissed or read all top notifications.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {rankedList.map((n) => {
            const badgeStyle = getRankBadgeStyles(n.rank);
            const isRead = n.read;

            return (
              <Card
                key={n.id}
                variant="outlined"
                sx={{
                  position: "relative",
                  opacity: isRead ? 0.72 : 1,
                  borderLeft: "4px solid",
                  borderLeftColor:
                    n.rank === 1
                      ? "#FFD700"
                      : n.rank === 2
                      ? "#C0C0C0"
                      : n.rank === 3
                      ? "#CD7F32"
                      : "primary.main",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => handleOpenDetails(n)}
              >
                <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {/* Rank Badge */}
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        flexShrink: 0,
                        ...badgeStyle,
                      }}
                    >
                      #{n.rank}
                    </Box>

                    {/* Content */}
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography
                          variant="subtitle1"
                          fontWeight={isRead ? 600 : 800}
                          noWrap
                          sx={{ maxWidth: "70%" }}
                        >
                          {n.title}
                        </Typography>
                        <Chip
                          label={n.type}
                          size="small"
                          color={
                            n.type === "Placement"
                              ? "primary"
                              : n.type === "Result"
                              ? "success"
                              : "secondary"
                          }
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {n.message}
                      </Typography>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {!isRead && (
                        <IconButton
                          size="small"
                          color="primary"
                          title="Mark as read"
                          onClick={(e) => handleMarkRead(e, n.id)}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        title="Dismiss"
                        onClick={(e) => handleDismiss(e, n.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedNotif)}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        {selectedNotif && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  Notification Details
                </Typography>
                <Chip
                  label={selectedNotif.type}
                  color={
                    selectedNotif.type === "Placement"
                      ? "primary"
                      : selectedNotif.type === "Result"
                      ? "success"
                      : "secondary"
                  }
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    TITLE
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5 }}>
                    {selectedNotif.title}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    MESSAGE
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                    {selectedNotif.message}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderRadius: 2,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    ALGORITHM DETAILS (MAX HEAP PRIORITY SCORE)
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Rank in Queue:
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      #{selectedNotif.rank} of {rankedList.length}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Priority Score:
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {selectedNotif.priorityScore?.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Date Created:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(selectedNotif.createdAt).toLocaleString("en-IN")}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => {
                  onDismiss(selectedNotif.id);
                  handleCloseDetails();
                }}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Dismiss
              </Button>
              {!selectedNotif.read && (
                <Button
                  onClick={() => {
                    onMarkRead(selectedNotif.id);
                    handleCloseDetails();
                  }}
                  color="primary"
                  variant="contained"
                  startIcon={<MarkEmailReadIcon />}
                >
                  Mark as Read
                </Button>
              )}
              <Button onClick={handleCloseDetails} color="inherit">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
