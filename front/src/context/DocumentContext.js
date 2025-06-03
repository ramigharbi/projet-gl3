"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../utils/jwtUtils";

// Set base URL for axios
axios.defaults.baseURL = "http://localhost:3000"; // Replace with your backend URL

// We'll use these templates for the copy feature
const documentTemplates = [
  {
    id: "1",
    title: "Document sans titre",
    type: "document",
    lastModified: new Date("2025-01-01T18:00:00"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content: "This is a blank document. Start typing to add content...",
    createdAt: new Date("2025-01-01T18:00:00"),
    updatedAt: new Date("2025-01-01T18:00:00"),
  },
  {
    id: "2",
    title: "Guerrilla Mail API",
    type: "document",
    lastModified: new Date("2025-04-21"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Guerrilla Mail API Documentation\n\nThis document contains the API documentation for the Guerrilla Mail service.\n\n## Overview\nGuerrilla Mail provides temporary email addresses for testing purposes.",
    createdAt: new Date("2025-04-20"),
    updatedAt: new Date("2025-04-21"),
  },
  {
    id: "3",
    title: "PU",
    type: "document",
    lastModified: new Date("2025-03-18"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Project Update\n\nThis document contains the latest project updates and milestones.\n\n## Recent Progress\n- Completed user interface design\n- Implemented core functionality\n- Started testing phase",
    createdAt: new Date("2025-03-15"),
    updatedAt: new Date("2025-03-18"),
  },
  {
    id: "4",
    title: "Optimisation_.docx",
    type: "word",
    lastModified: new Date("2025-03-14"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: true,
    owner: "current-user",
    content:
      "# Optimization Strategies\n\nThis document outlines various optimization strategies for improving system performance.\n\n## Performance Metrics\n- Load time reduction\n- Memory usage optimization\n- Database query optimization",
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-14"),
  },
  {
    id: "5",
    title: "SAIDI CHAYMA",
    type: "document",
    lastModified: new Date("2025-02-10"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content:
      "# CV - SAIDI CHAYMA\n\n## Contact Information\nEmail: chayma.saidi@example.com\nPhone: +33 1 23 45 67 89\n\n## Experience\n- Software Developer at Tech Company (2023-Present)\n- Junior Developer at Startup (2022-2023)",
    createdAt: new Date("2025-02-05"),
    updatedAt: new Date("2025-02-10"),
  },
  {
    id: "6",
    title: "Compte rendu mini-projet",
    type: "document",
    lastModified: new Date("2025-01-15"),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content:
      "# Mini-Project Report\n\n## Project Overview\nThis report summarizes the mini-project completed during the semester.\n\n## Objectives\n- Implement a web application\n- Use modern development practices\n- Document the development process\n\n## Results\nThe project was completed successfully with all requirements met.",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "1748798335703",
    title: "New Document",
    type: "document",
    lastModified: new Date(),
    thumbnail: "/placeholder.svg?height=300&width=200",
    isShared: false,
    owner: "current-user",
    content:
      "This is a new document created from a template. You can start editing here...",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DocumentContext = createContext(undefined);

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize documents on mount
  useEffect(() => {
    const initializeDocuments = async () => {
      try {
        const response = await axios.get("/api/documents/user", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setDocuments(response.data);
      } catch (error) {
        console.error("Failed to load documents from API:", error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDocuments();
  }, []);

  const getDocument = async (id) => {
    try {
      // Convert string id to number since backend expects numeric ids
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error("Invalid document ID");
      }

      const response = await axios.get(`/api/documents/${numericId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch document:", error);
      return null;
    }
  };

  const updateDocument = async (id, updates) => {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error("Invalid document ID");
      }

      const response = await axios.patch(
        `/api/documents/${numericId}`,
        updates,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc.id === numericId ? { ...doc, ...response.data } : doc
        )
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update document:", error);
      throw error;
    }
  };

  const createDocument = async (document) => {
    // Validate and transform the payload to match CreateDocumentDto
    const payload = {
      title: document.title || "Blank Document",
      content: document.content || "Enter your text here",
    };

    try {
      const response = await axios.post("/api/documents", payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const newDocument = response.data;
      setDocuments((prevDocuments) => [newDocument, ...prevDocuments]);
      return newDocument;
    } catch (error) {
      console.error("Failed to create document:", error);
      throw error;
    }
  };

  const deleteDocument = async (id) => {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error("Invalid document ID");
      }

      await axios.delete(`/api/documents/${numericId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // Remove document from state after successful deletion
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== numericId)
      );
      return true;
    } catch (error) {
      console.error("Failed to delete document:", error);
      throw error;
    }
  };

  const copyDocument = async (id) => {
    try {
      const docToCopy = documents.find((doc) => doc.id === id);
      if (!docToCopy) {
        throw new Error("Document not found");
      }

      // Create new document with copied content
      const newDoc = await createDocument({
        title: `${docToCopy.title} (copie)`,
        content: docToCopy.content,
        type: docToCopy.type,
      });

      return newDoc;
    } catch (error) {
      console.error("Failed to copy document:", error);
      throw error;
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        setDocuments,
        getDocument,
        updateDocument,
        createDocument,
        deleteDocument,
        copyDocument,
        isLoading,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}
