import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
