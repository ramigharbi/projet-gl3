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
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Start typing here..."
      }
    ],
  });
  const socketRef = useRef(null);

  // Socket.IO connection
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket.IO connected"));
    socket.on("disconnect", () => console.log("Socket.IO disconnected"));
    socket.on("editor:error", (error) => console.error("Editor error:", error));

    // Handle incoming updates
    socket.on("editor:update", (payload) => {
      try {
        if (payload.type === "full-doc" && payload.userId !== "myUserId") {
          console.log("Received update", payload);
          editor.replaceContent(payload.document);
        }
      } catch (e) {
        console.error("Error applying update:", e);
      }
    });

    // Send initial document state when connected
    const sendInitialState = () => {
      socket.emit("editor:update", {
        type: "full-doc",
        document: editor.document,
        userId: "myUserId",
      });
    };
    
    if (socket.connected) {
      sendInitialState();
    } else {
      socket.once("connect", sendInitialState);
    }

    // Listen for editor changes and send updates
    const handleEditorChange = () => {
      const update = {
        type: "full-doc",
        document: editor.document,
        userId: "myUserId",
      };
      socket.emit("editor:update", update);
    };

    editor.onChange(handleEditorChange);

    // Cleanup
    return () => {
      socket.off("editor:update");
      socket.off("editor:error");
      socket.disconnect();
    };
  }, [editor]);

  // Original WebSocket connection
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => console.log("WS connected");
    socket.onclose = () => console.log("WS disconnected");
    socket.onerror = (err) => console.error("WS error", err);

    // Apply inbound updates:
    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "full-doc" && editor) {
          editor.replaceDocument(msg.document);
        }
      } catch {
        console.warn("Invalid WS payload", evt.data);
      }
    };

    return () => {
      socket.close();
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

  // Send updates via Socket.IO
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const onChange = () => {
      if (socket.connected) {
        socket.emit("editor:update", {
          type: "full-doc",
          document: editor.document,
          userId: "myUserId",
        });
      }
    };

    editor.onChange(onChange);
    return () => editor.off("change", onChange);
  }, [editor]);

  return (
    <BlockNoteDefaultUI
      editor={editor}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
