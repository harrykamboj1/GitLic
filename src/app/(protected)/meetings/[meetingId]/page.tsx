import React from "react";
import { IssueList } from "./issue-list";

type MeetingsDetailsPageProps = {
  params: Promise<{ meetingId: string }>;
};

const MeetingsDetailsPage = async ({ params }: MeetingsDetailsPageProps) => {
  const { meetingId } = await params;

  return (
    <div>
      <IssueList meetingId={meetingId}></IssueList>
    </div>
  );
};

export default MeetingsDetailsPage;
