import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image"
import { Cloudinary } from "@cloudinary/url-gen";

// const cloudinary = require("cloudinary");
// import { Cloudinary } from "@cloudinary/v2";
// import { Cloudinary } from "@cloudinary/url-gen";
// cloudinary.config({
//   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUDNAME,
//   api_key: process.env.NEXT_PUBLIC_CLOUDINARY_APIKEY,
//   api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_APIKEY,
// });

export const EDITOR_TOOLS = {
  header: Header,
  paragraph: {
    class: Paragraph,
    inlineToolbar: true
  },
  list: {
    class: List,
    inlineToolbar: true
  },
  image: {
    class: ImageTool,
    drop: false,
    config: {
      field: 'photo',
      endpoints: {
        byFile: "/api/blog", // Your backend file uploader endpoint
        byUrl: "/api/blog", // Your endpoint that provides uploading by Url
      },
    }
  },
};