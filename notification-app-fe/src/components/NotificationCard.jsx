import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import CircleIcon from "@mui/icons-material/Circle";

const typeColors = {
  Placement: "primary",
  Result: "success",
  Event: "secondary",
};

export function NotificationCard({ notification, onMarkRead }) {
  const { id, title, message, type, read, createdAt } = notification;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      variant="outlined"
      sx={{
        opacity: read ? 0.72 : 1,
        borderLeft: read ? "3px solid transparent" : "3px solid",
        borderLeftColor: read ? "transparent" : "primary.main",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.5} sx={{ flex: 1, mr: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {!read && (
                <CircleIcon sx={{ fontSize: 8, color: "primary.main" }} />
              )}
              <Typography variant="subtitle1" fontWeight={read ? 500 : 700}>
                {title}
              </Typography>
              <Chip
                label={type}
                size="small"
                color={typeColors[type] || "default"}
                sx={{ height: 22, fontSize: "0.75rem" }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {formattedDate}
            </Typography>
          </Stack>

          {!read && (
            <IconButton
              size="small"
              title="Mark as read"
              onClick={() => onMarkRead?.(id)}
              sx={{ mt: 0.5 }}
            >
              <MarkEmailReadIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
