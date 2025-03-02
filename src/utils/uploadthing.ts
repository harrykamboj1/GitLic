"use client";
 
// import { UploadButton, UploadDropzone, Uploader } from "@uploadthing/react";
 
// // import "@uploadthing/react/styles.css";
 
// export { UploadButton, UploadDropzone, Uploader };


import {
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";
  
  import type { OurFileRouter } from "../app/api/uploadthing/core";
  
  export const UploadButton = generateUploadButton<OurFileRouter>();
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
  