import { OurFileRouter } from "../app/(server)/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";


export const { useUploadThing, uploadFiles } = generateReactHelpers< OurFileRouter >();