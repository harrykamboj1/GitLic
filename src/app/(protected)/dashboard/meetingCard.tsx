"use client";
import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { Presentation } from "lucide-react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { UploadDropzone } from "@/utils/uploadthing";

const MeetingCard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-2">
      {!isUploading && !uploadedFileUrl && (
        <>
          <div className="w-full max-w-xs hover:cursor-pointer">
            <UploadDropzone
              appearance={{
                button:
                  "bg-blue-600 hover:bg-blue-700 text-white  py-2 px-4 rounded",
                container:
                  "border-2 border-dashed border-gray-300 p-4 rounded-lg",
                label: "text-gray-700 text-sm font-medium",
              }}
              content={{
                uploadIcon: (
                  <Presentation className="h-10 w-10 animate-bounce" />
                ),
                label: "Create And Analyze Your Meeting With Gitlic",
              }}
              endpoint="audioUploader"
              onUploadBegin={() => {
                setIsUploading(true);
              }}
              onUploadProgress={(progress) => {
                setProgress(progress);
              }}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                if (res && res.length > 0) {
                  setUploadedFileUrl(res[0]!.ufsUrl);
                  window.alert(`Upload complete: ${res[0]?.ufsUrl}`);
                }
              }}
              onUploadError={(error) => {
                setIsUploading(false);
                alert(`ERROR! ${error.message}`);
              }}
              config={{ mode: "auto" }}
            />
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex flex-col items-center justify-center">
          <CircularProgressbar
            className="size-20"
            value={progress}
            text={`${progress}%`}
          />
          <p className="mt-2 text-center font-semibold text-gray-500">
            Uploading Your Meeting
          </p>
        </div>
      )}
      {uploadedFileUrl && !isUploading && (
        <div className="flex flex-col items-center justify-center">
          <Presentation className="h-10 w-10 text-green-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Upload Complete!
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Your meeting has been uploaded successfully.
          </p>
          <button
            onClick={() => setUploadedFileUrl(null)}
            className="mt-4 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Upload Another
          </button>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
