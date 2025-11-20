import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { DragIndicator, Restore } from "@mui/icons-material";
import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DEFAULT_FIELDS, FieldConfig, useTableConfig } from "./state/useTableConfig";

function SortableListItem({ field }: { field: FieldConfig }) {
  const { updateField } = useTableConfig();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      divider
      alignItems="flex-start"
      sx={{
        borderBottom: "1px solid rgba(66, 153, 225, 0.1)",
        "&:hover": {
          bgcolor: "rgba(66, 153, 225, 0.05)"
        },
        cursor: isDragging ? "grabbing" : "grab"
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        sx={{
          color: "#cbd5e0",
          cursor: "grab",
          mr: 1,
          "&:hover": {
            bgcolor: "rgba(66, 153, 225, 0.1)",
            color: "#4299e1"
          },
          "&:active": {
            cursor: "grabbing"
          }
        }}
      >
        <DragIndicator />
      </IconButton>
      <ListItemText
        primary={
          <TextField
            label="Header label"
            value={field.label}
            size="small"
            onChange={(event) =>
              updateField(field.id, { label: event.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#0f1428",
                color: "#cbd5e0",
                "& fieldset": {
                  borderColor: "rgba(66, 153, 225, 0.2)"
                },
                "&:hover fieldset": {
                  borderColor: "rgba(66, 153, 225, 0.4)"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4299e1"
                }
              },
              "& .MuiInputLabel-root": {
                color: "rgba(203, 213, 224, 0.7)"
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#4299e1"
              }
            }}
          />
        }
        secondary={
          <Typography
            variant="body2"
            sx={{
              color: "rgba(203, 213, 224, 0.6)",
              mt: 0.5
            }}
          >
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
        <Typography
          variant="body2"
          sx={{
            color: "#cbd5e0"
          }}
        >
          Visible
        </Typography>
        <Switch
          edge="end"
          checked={field.visible}
          onChange={(_event, checked) => updateField(field.id, { visible: checked })}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#4299e1"
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              bgcolor: "#4299e1"
            },
            "& .MuiSwitch-track": {
              bgcolor: "rgba(203, 213, 224, 0.3)"
            }
          }}
        />
      </Stack>
    </ListItem>
  );
}

export function ConfigPage() {
  const { fields, setFields } = useTableConfig();

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedFields.findIndex((field) => field.id === active.id);
      const newIndex = sortedFields.findIndex((field) => field.id === over.id);

      const reorderedFields = arrayMove(sortedFields, oldIndex, newIndex);
      const updatedFields = reorderedFields.map((field, index) => ({
        ...field,
        order: index
      }));

      setFields(updatedFields);
    }
  };

  const handleReset = () => {
    setFields(DEFAULT_FIELDS.map((field) => ({ ...field })));
  };

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h5"
          sx={{
            color: "#e2e8f0",
            fontWeight: 700,
            letterSpacing: "0.5px"
          }}
        >
          Table Configuration
        </Typography>
        <Button
          startIcon={<Restore />}
          onClick={handleReset}
          variant="contained"
        >
          Reset defaults
        </Button>
      </Box>
      <Paper
        sx={{
          bgcolor: "#0a0e27",
          backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
          borderRadius: 3,
          border: "1px solid rgba(66, 153, 225, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(66, 153, 225, 0.1)",
          overflow: "hidden"
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedFields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <List disablePadding>
              {sortedFields.map((field) => (
                <SortableListItem key={field.id} field={field} />
              ))}
            </List>
          </SortableContext>
        </DndContext>
      </Paper>
    </Stack>
  );
}
