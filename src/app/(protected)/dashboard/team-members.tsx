import useProject from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import Image from "next/image";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  return (
    <div>
      {members?.map((member) => (
        <img
          src={member.user.imageUrl ?? ""}
          alt={member.user.firstName ?? ""}
          key={member.id}
          height={30}
          className="rounded-2xl"
          width={30}
        />
      ))}
    </div>
  );
};

export default TeamMembers;
