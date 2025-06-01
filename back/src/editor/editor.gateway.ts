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

@WebSocketGateway({
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
  private defaultValue = '';

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
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
  handleSendChanges(client: Socket, delta: any) {
    try {
      // Get the document ID from the client's current room
      const rooms = Array.from(client.rooms);
      const documentId = rooms.find(room => room !== client.id);
      
      if (documentId) {
        // Broadcast the changes to all other clients in the same document room
        client.broadcast.to(documentId).emit('receive-changes', delta);
        console.log(`Changes sent from ${client.id} for document ${documentId}`);
      }
    } catch (error) {
      console.error('Error sending changes:', error);
    }
  }

  @SubscribeMessage('save-document')
  async handleSaveDocument(client: Socket, data: any) {
    try {
      // Get the document ID from the client's current room
      const rooms = Array.from(client.rooms);
      const documentId = rooms.find(room => room !== client.id);
      
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
      if (payload.type === 'full-doc' && this.isValidDocument(payload.document)) {
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
