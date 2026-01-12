import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncPlayers } from "../../../api/players";

export function useSync() {
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: syncPlayers,
    onSuccess: (summary) => {
      void queryClient.invalidateQueries({ queryKey: ["players"] });
      setSnackbarMessage(
        `Sync complete: ${summary.playersCreated} new, ${summary.playersUpdated} updated, ${summary.totalChanges} changes`
      );
    },
    onError: (error: unknown) => {
      setSnackbarMessage(
        error instanceof Error ? `Sync failed: ${error.message}` : "Sync failed"
      );
    }
  });

  return {
    sync: () => syncMutation.mutate(),
    isPending: syncMutation.isPending,
    snackbarMessage,
    clearSnackbar: () => setSnackbarMessage(null)
  };
}
