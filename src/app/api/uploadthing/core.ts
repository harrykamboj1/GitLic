import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  audioUploader: f({ audio: { maxFileSize: "256MB", maxFileCount: 1 } })
    .middleware(async ({  }) => {
   
      return { };
    })
    .onUploadComplete(async ({  file }) => {
 
      return {url: file.ufsUrl};
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;