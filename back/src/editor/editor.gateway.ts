import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Define the structure for Quill document
interface QuillDocument {
  _id: string;
  data: any; // Quill Delta format
}

// Define the structure of the document
interface BlockNoteDocument {
  type: string;
  content: unknown[];
}

interface EditorUpdate {
  type: 'full-doc';
  document: BlockNoteDocument;
  userId: string;
}

interface CursorPosition {
  userId: string;
  documentId: string;
  range: any; // Quill range format
  userName?: string;
}

/**
 * WebSocket Gateway for real-time document editing and cursor tracking.
 * Now served under '/editor' namespace to support user-specific connections.
 */
@WebSocketGateway({
  namespace: 'editor',
  cors: {
    origin: '*',
  },
})
export class EditorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private lastDocument: BlockNoteDocument | null = null;
  // In-memory storage for Quill documents
  private documents: Map<string, QuillDocument> = new Map();
  // Track user cursors by document
  private userCursors: Map<string, Map<string, any>> = new Map();
  private defaultValue = '';

  handleConnection(client: Socket) {
    // Extract user email and displayName from handshake auth and store on socket data
    // Read email and displayName from handshake (auth or query)
    const email =
      client.handshake.auth?.email ||
      client.handshake.query?.email ||
      'anonymous';
    const displayName =
      client.handshake.auth?.displayName ||
      client.handshake.query?.displayName ||
      'Anonymous';
    client.data.userId = email;
    client.data.displayName = displayName;
    console.log(
      `Client connected: ${client.id} (user: ${email} / ${displayName})`,
    );
    // Send the last known document state to new clients
    if (this.lastDocument) {
      client.emit('editor:update', {
        type: 'full-doc',
        document: this.lastDocument,
        userId: 'server',
      });
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove user cursors from all documents and notify other clients by userId
    this.userCursors.forEach((documentCursors, documentId) => {
      if (documentCursors.has(client.id)) {
        // Retrieve stored userId (e.g., email)
        const cursorInfo = documentCursors.get(client.id);
        // Use stored userId (email) if available
        const userId = cursorInfo?.userId || client.data.userId;
        // Remove from in-memory storage
        documentCursors.delete(client.id);
        if (userId) {
          // Notify other users to remove cursor by userId
          client.broadcast.to(documentId).emit('user-disconnected', userId);
        }
      }
    });
  }

  // Quill document handlers
  @SubscribeMessage('get-document')
  async handleGetDocument(client: Socket, documentId: string) {
    try {
      const document = this.findOrCreateDocument(documentId);
      client.join(documentId);
      client.emit('load-document', document.data);

      console.log(`Document ${documentId} loaded for client ${client.id}`);
    } catch (error) {
      console.error('Error loading document:', error);
      client.emit('error', { message: 'Failed to load document' });
    }
  }
  @SubscribeMessage('send-changes')
  handleSendChanges(
    client: Socket,
    payload: { delta: any; documentId: string },
  ) {
    try {
      const { delta, documentId } = payload;

      if (documentId) {
        // Broadcast the changes to all other clients in the same document room
        client.broadcast.to(documentId).emit('receive-changes', delta);
        console.log(
          `Changes sent from ${client.id} for document ${documentId}`,
        );
      }
    } catch (error) {
      console.error('Error sending changes:', error);
    }
  }
  @SubscribeMessage('save-document')
  async handleSaveDocument(
    client: Socket,
    payload: { data: any; documentId: string },
  ) {
    try {
      const { data, documentId } = payload;

      if (documentId) {
        // Update the document in memory
        const document = this.documents.get(documentId);
        if (document) {
          document.data = data;
          console.log(`Document ${documentId} saved by client ${client.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      client.emit('error', { message: 'Failed to save document' });
    }
  }
  @SubscribeMessage('cursor-position')
  handleCursorPosition(client: Socket, payload: CursorPosition) {
    try {
      const { userId, documentId, range, userName } = payload;

      if (documentId) {
        // Track cursor position for this document
        if (!this.userCursors.has(documentId)) {
          this.userCursors.set(documentId, new Map());
        }

        const documentCursors = this.userCursors.get(documentId)!;

        if (range) {
          // Store cursor information
          documentCursors.set(client.id, { userId, range, userName });
        } else {
          // Remove cursor if no range
          documentCursors.delete(client.id);
        }

        // Broadcast cursor position to all other clients using provided userId
        client.broadcast.to(documentId).emit('cursor-update', {
          userId: userId, // Use provided userId (e.g., email)
          range,
          userName,
          socketId: client.id, // Include socket ID to allow clients to skip own events
        });

        console.log(
          `Cursor position updated for user ${userName} (${client.id}) in document ${documentId}`,
          range,
        );
      }
    } catch (error) {
      console.error('Error handling cursor position:', error);
    }
  }

  // Helper method to find or create a document
  private findOrCreateDocument(id: string): QuillDocument {
    if (!id) {
      throw new Error('Document ID is required');
    }

    let document = this.documents.get(id);
    if (document) {
      return document;
    }

    // Create new document if it doesn't exist
    document = {
      _id: id,
      data: this.defaultValue,
    };

    this.documents.set(id, document);
    console.log(`Created new document: ${id}`);

    return document;
  }

  @SubscribeMessage('editor:update')
  handleEditorUpdate(client: Socket, payload: EditorUpdate) {
    try {
      // Validate and store the latest document state
      if (
        payload.type === 'full-doc' &&
        this.isValidDocument(payload.document)
      ) {
        this.lastDocument = payload.document;

        // Log the update
        console.log(`Received update from ${client.id}:`, {
          type: payload.type,
          userId: payload.userId,
          timestamp: new Date().toISOString(),
        });

        // Broadcast to all clients except sender
        client.broadcast.emit('editor:update', payload);
      }
    } catch (error) {
      console.error('Error processing editor update:', error);
      client.emit('editor:error', { message: 'Invalid update format' });
    }
  }

  private isValidDocument(doc: unknown): doc is BlockNoteDocument {
    if (!doc || typeof doc !== 'object') return false;
    const document = doc as Partial<BlockNoteDocument>;
    return typeof document.type === 'string' && Array.isArray(document.content);
  }
}
