import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import "./style.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { getCurrentUser, extractDisplayName } from "../../utils/jwtUtils";

// Register the cursors module
Quill.register("modules/cursors", QuillCursors);

// Generate consistent color based on email/userId with direct mapping
const generateUserColor = (userId) => {
  const colors = [
    "#FF6B6B", // Coral Red
    "#4ECDC4", // Turquoise
    "#45B7D1", // Sky Blue
    "#96CEB4", // Mint Green
    "#FECA57", // Golden Yellow
    "#FF9FF3", // Light Pink
    "#54A0FF", // Bright Blue
    "#5F27CD", // Deep Purple
    "#00D2D3", // Cyan
    "#FF9F43", // Orange
    "#10AC84", // Emerald
    "#EE5A24", // Red Orange
    "#0ABDE3", // Light Blue
    "#C44569", // Dark Pink
    "#F8B500", // Amber
    "#8E44AD", // Purple
    "#2ECC71", // Green
    "#E74C3C", // Red
    "#3498DB", // Blue
    "#F39C12", // Yellow Orange
  ];

  if (!userId) return colors[0];

  // Create a simple but consistent mapping based on the userId string
  // This ensures the same email always gets the same color across all tabs/sessions
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }

  const index = sum % colors.length;
  const selectedColor = colors[index];

  console.log(
    `Color for user ${userId}: ${selectedColor} (sum: ${sum}, index: ${index})`
  );

  return selectedColor;
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

export default function TextEditor({ onSelection = () => {} }) {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [cursors, setCursors] = useState();
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user from JWT token when component mounts
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      console.log("Current user loaded:", user);
    } else {
      console.warn("No current user found - user may not be authenticated");
      // Fallback to anonymous user
      setCurrentUser({
        userId: "anonymous",
        username: "anonymous",
        email: "anonymous",
        displayName: "Anonymous",
      });
    }
  }, []);
  useEffect(() => {
    if (!currentUser) return;
    // Connect to the 'editor' namespace and pass user credentials as query params
    const s = io("http://localhost:3000/editor", {
      query: {
        email: currentUser.email,
        displayName: currentUser.displayName,
      },
    });
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
  }, [cursors, currentUser]);

  // Handle cursor position updates from other users
  useEffect(() => {
    if (socket == null || cursors == null || currentUser == null) return;

    const handleCursorUpdate = (data) => {
      // Extract identifier and skip only own socket events
      const { userId, range, userName, socketId: remoteSocketId } = data;
      if (remoteSocketId === socket.id) {
        return;
      }

      try {
        if (range && range.index !== undefined) {
          const color = generateUserColor(userId);
          const displayName = userName || extractDisplayName(userId);

          cursors.createCursor(userId, displayName, color);
          cursors.toggleFlag(userId, true);
          cursors.moveCursor(userId, range);
        } else {
          cursors.removeCursor(userId);
        }
      } catch (error) {
        console.error("Error updating cursor:", error);
      }
    };

    socket.on("cursor-update", handleCursorUpdate);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
    };
  }, [socket, cursors, currentUser]);

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
    if (socket == null || quill == null || currentUser == null) return;

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
  }, [socket, quill, documentId, currentUser]); // Handle selection changes to update cursor position
  useEffect(() => {
    if (socket == null || quill == null || currentUser == null) return;

    const handleSelectionChange = (range, oldRange, source) => {
      // Only send cursor updates for user interactions
      if (source !== "user") return;

      console.log("Selection changed:", {
        range,
        source,
        userId: currentUser.userId,
        username: currentUser.username,
      });

      if (
        range &&
        quill.hasFocus() &&
        onSelection &&
        typeof onSelection === "function"
      ) {
        onSelection({
          start: range.index,
          end: range.index + (range.length || 0),
        });
      }

      socket.emit("cursor-position", {
        userId: currentUser.email, // Use email for consistent identifier across tabs
        documentId: documentId,
        range: range, // This can be null when selection is lost
        userName: currentUser.displayName, // Use extracted display name
      });
    };

    quill.on("selection-change", handleSelectionChange);

    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, [socket, quill, documentId, currentUser, onSelection]);
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
