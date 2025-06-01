import { DefaultThreadStoreAuth } from '@blocknote/core/comments';

/**
 * Custom ThreadStore implementation that integrates with our GraphQL backend
 * while maintaining real-time synchronization
 */
export class GraphQLThreadStore {
  constructor(userId, commentsHook, auth) {
    this.userId = userId;
    this.commentsHook = commentsHook;
    this.auth = auth || new DefaultThreadStoreAuth(userId, 'editor');
    this.threads = new Map();
    this.listeners = new Set();
    
    // Initialize threads from the comments hook
    this.syncFromCommentsHook();
    
    // Listen for changes from the unified comments hook
    this.setupRealtimeSync();
  }

  /**
   * Convert GraphQL comment format to BlockNote thread format
   */
  commentToThread(comment) {
    return {
      id: comment.commentId,
      blockId: `block-${Math.floor(comment.rangeStart / 100)}`, // Approximate block mapping
      position: {
        start: comment.rangeStart,
        end: comment.rangeEnd
      },
      comments: [{
        id: `${comment.commentId}-comment`,
        authorId: comment.author,
        body: comment.text,
        createdAt: new Date(comment.createdAt).getTime(),
        updatedAt: new Date(comment.updatedAt || comment.createdAt).getTime(),
        reactions: []
      }],
      status: 'open',
      createdAt: new Date(comment.createdAt).getTime(),
      updatedAt: new Date(comment.updatedAt || comment.createdAt).getTime()
    };
  }

  /**
   * Convert BlockNote thread format back to GraphQL comment format
   */
  threadToComment(thread) {
    const firstComment = thread.comments[0];
    return {
      rangeStart: thread.position.start,
      rangeEnd: thread.position.end,
      text: firstComment.body,
      author: firstComment.authorId
    };
  }

  /**
   * Sync initial data from the comments hook
   */
  syncFromCommentsHook() {
    if (this.commentsHook.commentsMap) {
      this.threads.clear();
      this.commentsHook.commentsMap.forEach((comment) => {
        const thread = this.commentToThread(comment);
        this.threads.set(thread.id, thread);
      });
      this.notifyListeners();
    }
  }

  /**
   * Setup real-time synchronization with the GraphQL backend
   */
  setupRealtimeSync() {
    // Poll for changes from the comments hook (in a real implementation, 
    // you might want to use a more sophisticated observation pattern)
    this.syncInterval = setInterval(() => {
      const currentSize = this.threads.size;
      const hookSize = this.commentsHook.commentsMap?.size || 0;
      
      if (currentSize !== hookSize) {
        this.syncFromCommentsHook();
      }
    }, 1000);
  }

  /**
   * Add a listener for thread changes
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in thread store listener:', error);
      }
    });
  }

  /**
   * Get all threads
   */
  getThreads() {
    return Array.from(this.threads.values());
  }

  /**
   * Get a specific thread by ID
   */
  getThread(threadId) {
    return this.threads.get(threadId);
  }

  /**
   * Create a new thread
   */
  async createThread(thread) {
    try {
      const commentData = this.threadToComment(thread);
      
      // Use the unified comments hook to add the comment
      await this.commentsHook.addComment(
        { start: commentData.rangeStart, end: commentData.rangeEnd },
        commentData.text,
        commentData.author
      );
      
      // The thread will be added via the real-time sync
      return thread.id;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  /**
   * Update an existing thread
   */
  async updateThread(threadId, update) {
    try {
      const thread = this.threads.get(threadId);
      if (!thread) {
        throw new Error(`Thread ${threadId} not found`);
      }

      // Find the corresponding comment in the GraphQL system
      const comment = Array.from(this.commentsHook.commentsMap.values())
        .find(c => c.commentId === threadId);
      
      if (!comment) {
        throw new Error(`Comment ${threadId} not found in GraphQL system`);
      }

      // Update the comment using the unified hook
      if (update.comments && update.comments[0] && update.comments[0].body) {
        await this.commentsHook.updateComment(comment, update.comments[0].body);
      }

      return threadId;
    } catch (error) {
      console.error('Error updating thread:', error);
      throw error;
    }
  }

  /**
   * Delete a thread
   */
  async deleteThread(threadId) {
    try {
      // Use the unified comments hook to delete the comment
      await this.commentsHook.deleteComment(threadId);
      
      // The thread will be removed via the real-time sync
      return true;
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }

  /**
   * Add a comment to an existing thread
   */
  async addCommentToThread(threadId, comment) {
    try {
      // For simplicity, we'll update the existing comment text
      // In a more sophisticated implementation, you might support multiple comments per thread
      const thread = this.threads.get(threadId);
      if (!thread) {
        throw new Error(`Thread ${threadId} not found`);
      }

      const existingComment = Array.from(this.commentsHook.commentsMap.values())
        .find(c => c.commentId === threadId);
      
      if (existingComment) {
        const updatedText = `${existingComment.text}\n\n${comment.authorId}: ${comment.body}`;
        await this.commentsHook.updateComment(existingComment, updatedText);
      }

      return `${threadId}-comment-${Date.now()}`;
    } catch (error) {
      console.error('Error adding comment to thread:', error);
      throw error;
    }
  }

  /**
   * Update a comment in a thread
   */
  async updateComment(threadId, commentId, update) {
    // Delegate to updateThread for simplicity
    return this.updateThread(threadId, { comments: [update] });
  }

  /**
   * Delete a comment from a thread
   */
  async deleteComment(threadId, commentId) {
    // For simplicity, delete the entire thread
    return this.deleteThread(threadId);
  }

  /**
   * Check if user can perform an action
   */
  canCreate() {
    return this.auth.canCreate();
  }

  canEdit(threadId) {
    return this.auth.canEdit(threadId);
  }

  canDelete(threadId) {
    return this.auth.canDelete(threadId);
  }

  canResolve(threadId) {
    return this.auth.canResolve(threadId);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
  }
}
