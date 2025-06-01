import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import "./style.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

// Register the cursors module
Quill.register("modules/cursors", QuillCursors);

// Generate consistent color based on user ID
const generateUserColor = (userId) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
    "#00D2D3",
    "#FF9F43",
    "#10AC84",
    "#EE5A24",
    "#0ABDE3",
    "#C44569",
    "#F8B500",
  ];

  // Create a simple hash from userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
};

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor({ onSelection }) {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [cursors, setCursors] = useState();
  const [currentUserId, setCurrentUserId] = useState();

  // Generate a unique user ID when component mounts
  useEffect(() => {
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentUserId(userId);
  }, []);
  useEffect(() => {
    const s = io("http://localhost:3000");
    setSocket(s);

    // Send user connection info
    s.on("connect", () => {
      console.log("Connected to server with ID:", s.id);
    });

    // Handle user disconnections
    s.on("user-disconnected", (userId) => {
      if (cursors) {
        cursors.removeCursor(userId);
        console.log(`Removed cursor for disconnected user: ${userId}`);
      }
    });

    return () => {
      s.disconnect();
    };
  }, [cursors]); // Handle cursor position updates from other users
  useEffect(() => {
    if (socket == null || cursors == null) return;

    const handleCursorUpdate = (data) => {
      const { userId, range, userName } = data;

      // Don't show our own cursor (userId is now socket.id from backend)
      if (userId === socket.id) return;

      try {
        if (range && range.index !== undefined) {
          const color = generateUserColor(userId);
          // Use provided userName if available, otherwise fallback to 'user' plus ID substring
          const displayName = userName || `user${userId.slice(3)}`;

          // Create cursor if it doesn't exist
          cursors.createCursor(userId, displayName, color);
          console.log(`Cursor name: ${displayName} (created)`);

          // Explicitly try to show the flag
          cursors.toggleFlag(userId, true);
          console.log(`Flag for ${displayName} toggled to show.`);

          // Move cursor to new position
          cursors.moveCursor(userId, range);

          console.log(`Updated cursor for ${displayName} at position:`, range);
        } else {
          // Remove cursor if no range (user disconnected or no selection)
          cursors.removeCursor(userId);
          console.log(`Removed cursor for user ${userId}`);
        }
      } catch (error) {
        console.error("Error updating cursor:", error);
      }
    };

    socket.on("cursor-update", handleCursorUpdate);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
    };
  }, [socket, cursors]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", {
        data: quill.getContents(),
        documentId: documentId,
      });
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);
  useEffect(() => {
    if (socket == null || quill == null || currentUserId == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", {
        delta: delta,
        documentId: documentId,
      });
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill, documentId, currentUserId]);
  // Handle selection changes to update cursor position
  useEffect(() => {
    if (socket == null || quill == null || currentUserId == null) return;

    const handleSelectionChange = (range, oldRange, source) => {
      // Only send cursor updates for user interactions
      if (source !== "user") return;

      console.log("Selection changed:", {
        range,
        source,
        userId: currentUserId,
      });
      if(quill.hasFocus()) {
        onSelection({
          start: range.index,
          end: range.index + (range.length || 0),
        });
      }

      socket.emit("cursor-position", {
        userId: currentUserId,
        documentId: documentId,
        range: range, // This can be null when selection is lost
        // Tag as 'user' plus last 4 chars of ID for consistent naming
        userName: `user${currentUserId.slice(-4)}`,
      });
    };

    quill.on("selection-change", handleSelectionChange);

    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, [socket, quill, documentId, currentUserId, onSelection]);
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: {
          transformOnTextChange: true,
          hideDelayMs: 5000,
          hideSpeedMs: 300,
          selectionChangeSource: null,
        },
      },
    });

    q.disable();
    q.setText("Loading...");
    setQuill(q);

    // Get the cursors module instance after Quill is fully initialized
    setTimeout(() => {
      const cursorsModule = q.getModule("cursors");
      setCursors(cursorsModule);
      console.log("Cursors module initialized:", cursorsModule);
    }, 100);
  }, []);
  return <div className="container" ref={wrapperRef}></div>;
}
