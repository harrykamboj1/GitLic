"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-projects";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export const ArchieveButton = () => {
  const archieveProject = api.project.archieveProject.useMutation();
  const projectId = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archieveProject.isPending}
      size={"sm"}
      variant={"destructive"}
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archieve this project?",
        );
        if (confirm) {
          archieveProject.mutate(
            { projectId: projectId.projectId },
            {
              onSuccess: () => {
                toast.success("Project archieved successfully");
                void refetch();
              },
              onError: () => {
                toast.error("Failed to archieve project");
              },
            },
          );
        }
      }}
    >
      Archieve
    </Button>
  );
};
