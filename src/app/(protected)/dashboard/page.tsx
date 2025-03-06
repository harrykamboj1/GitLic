"use client";
import useProject from "@/hooks/use-projects";
import { Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commitLog";
import QuestionCard from "./questionCard";
import MeetingCard from "./meetingCard";
import { ArchieveButton } from "./archieve-project";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

const DashboardPage = () => {
  const { project } = useProject();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4 px-4 py-2">
        <div className="w-fit rounded-md bg-primary px-4 py-2">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2 flex items-center gap-x-1">
              <p className="text-sm font-medium text-white">Project Link</p>
              <Link
                href={project?.githubUrl ?? ""}
                className="inline-flex items-center text-white/80 hover:underline"
              >
                {project?.githubUrl}
              </Link>
            </div>
          </div>
        </div>

        <div className="h-4"></div>

        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchieveButton />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-5">
          <QuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className="mt-8 px-4 pb-5">
        <CommitLog />
      </div>
    </div>
  );
};

export default DashboardPage;
