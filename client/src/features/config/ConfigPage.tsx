import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { ArrowDownward, ArrowUpward, Restore } from "@mui/icons-material";
import { useMemo } from "react";
import { DEFAULT_FIELDS, FieldConfig, useTableConfig } from "./state/useTableConfig";

export function ConfigPage() {
  const { fields, setFields, updateField } = useTableConfig();

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  );

  const moveField = (field: FieldConfig, direction: "up" | "down") => {
    const targetOrder = direction === "up" ? field.order - 1 : field.order + 1;

    if (targetOrder < 0 || targetOrder >= sortedFields.length) {
      return;
    }

    const swapField = sortedFields.find((item) => item.order === targetOrder);
    if (!swapField) return;

    const updated = sortedFields.map((item) => {
      if (item.id === field.id) {
        return { ...item, order: targetOrder };
      }
      if (item.id === swapField.id) {
        return { ...item, order: field.order };
      }
      return item;
    });

    setFields(updated);
  };

  const handleReset = () => {
    setFields(DEFAULT_FIELDS.map((field) => ({ ...field })));
  };

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Table Configuration</Typography>
        <Button startIcon={<Restore />} onClick={handleReset}>
          Reset defaults
        </Button>
      </Box>
      <Paper variant="outlined">
        <List disablePadding>
          {sortedFields.map((field, index) => (
            <ListItem divider key={field.id} alignItems="flex-start">
              <ListItemText
                primary={
                  <TextField
                    label="Header label"
                    value={field.label}
                    size="small"
                    onChange={(event) =>
                      updateField(field.id, { label: event.target.value })
                    }
                  />
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Field ID: {field.id}
                  </Typography>
                }
              />
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mr: 6, minWidth: 180 }}
              >
                <Typography variant="body2">Visible</Typography>
                <Switch
                  edge="end"
                  checked={field.visible}
                  onChange={(_event, checked) => updateField(field.id, { visible: checked })}
                />
              </Stack>
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="Move up"
                  onClick={() => moveField(field, "up")}
                  disabled={index === 0}
                >
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="Move down"
                  onClick={() => moveField(field, "down")}
                  disabled={index === sortedFields.length - 1}
                >
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Stack>
  );
}
