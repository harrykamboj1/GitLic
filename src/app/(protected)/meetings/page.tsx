"use client";
import useProject from "@/hooks/use-projects";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meetingCard";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const MeetingPage = () => {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 50000,
    },
  );

  const deleteMeeting = api.project.deleteMeetings.useMutation();

  return (
    <div className="space-y-2 p-4">
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No Meetings Found</div>}
      {isLoading && <div>Loading...</div>}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/meetings/${meeting.id}`}
                  className="text-sm font-semibold"
                >
                  {meeting?.name}
                </Link>
                {meeting.status === "PROCESSING" && (
                  <Badge className="bg-yellow-500 text-white">
                    Processing...
                  </Badge>
                )}
                {meeting.status === "COMPLETED" && (
                  <Badge className="bg-green-500 text-white">Processed</Badge>
                )}
              </div>

              <div className="flex items-center gap-x-2 text-xs text-gray-500">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.Issues.length} issues</p>
              </div>
            </div>

            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button size={"sm"} variant={"outline"}>
                  View Meeting
                </Button>
              </Link>
              <Button
                disabled={deleteMeeting.isPending}
                size={"sm"}
                variant={"destructive"}
                onClick={() =>
                  deleteMeeting.mutate(
                    { meetingId: meeting.id },
                    {
                      onSuccess: async () => {
                        toast.success("Meeting Deleted");
                        await refetch();
                      },
                      onError: () => {
                        toast.error("Failed to delete meeting");
                      },
                    },
                  )
                }
              >
                Delete Meeting
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingPage;
