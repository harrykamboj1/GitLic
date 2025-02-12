import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("gitlic-project", "");
  const project = projects?.find(
    (project: { id: string }) => project.id === projectId,
  );

  return {
    projects,
    setProjectId,
    project,
    projectId,
  };
};

export default useProject;
