import React, { useEffect, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { io } from "socket.io-client";

import {
  useCreateBlockNote,
  useBlockNoteEditor,
  BlockNoteDefaultUI,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

export default function BlockNoteEditor() {
  const editor = useCreateBlockNote();
  const socketRef = useRef(null);

  // 1) Establish Socket.IO connection once:
  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket.IO connected"));
    socket.on("disconnect", () => console.log("Socket.IO disconnected"));
    socket.on("connect_error", (err) => console.error("Socket.IO error", err));

    // 2) Apply inbound updates:
    socket.on("editor:update", (msg) => {
      try {
        if (msg.type === "full-doc" && editor) {
          editor.replaceDocument(msg.document);
        }
      } catch (err) {
        console.warn("Invalid socket payload", msg);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <BlockNoteView editor={editor}>
        <CollaborativeEditor socketRef={socketRef} />
      </BlockNoteView>
    </div>
  );
}

function CollaborativeEditor({ socketRef }) {
  const editor = useBlockNoteEditor();

  // 3) Send full-document on every change:
  useEffect(() => {
    const onChange = () => {
      if (socketRef.current?.connected) {
        console.log("Sending full document update", editor.document);
        socketRef.current.emit("editor:update", {
          type: "full-doc",
          document: editor.document,
          userId: "user-123", // your own user ID logic
        });
      }
    };

    editor.onChange(onChange);
    return () => editor.off("change", onChange);
  }, [editor, socketRef]);

  return (
    <BlockNoteDefaultUI
      editor={editor}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
