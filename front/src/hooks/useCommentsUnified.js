import React from 'react';
import { gql, useQuery, useSubscription, useMutation } from '@apollo/client';

// GraphQL Queries and Subscriptions
export const GET_COMMENTS = gql`
  query GetComments($docId: ID!) {
    comments(docId: $docId) {
      commentId
      docId
      author
      text
      rangeStart
      rangeEnd
      createdAt
      updatedAt
    }
  }
`;

export const COMMENT_EVENTS = gql`
  subscription CommentEvent($docId: ID!) {
    commentEvent(docId: $docId) {
      type
      comment {
        commentId
        docId
        author
        text
        rangeStart
        rangeEnd
        createdAt
        updatedAt
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($docId: ID!, $input: CommentInput!) {
    addComment(docId: $docId, input: $input) {
      commentId
      docId
      text
      author
      createdAt
      updatedAt
      rangeStart
      rangeEnd
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($docId: ID!, $commentId: ID!, $input: CommentInput!) {
    updateComment(docId: $docId, commentId: $commentId, input: $input) {
      commentId
      docId
      text
      author
      createdAt
      updatedAt
      rangeStart
      rangeEnd
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($docId: ID!, $commentId: ID!) {
    deleteComment(docId: $docId, commentId: $commentId)
  }
`;

/**
 * Unified hook that combines real-time comment subscriptions with action methods
 * Provides both the live comment map and methods to manipulate comments
 */
export function useCommentsUnified(docId) {
  // Query for initial comments
  const { data, loading, refetch } = useQuery(GET_COMMENTS, { 
    variables: { docId },
    fetchPolicy: 'cache-and-network'
  });

  // Subscribe to real-time comment events
  const { data: subData } = useSubscription(COMMENT_EVENTS, { 
    variables: { docId },
    onError: (error) => {
      console.warn('Comment subscription error:', error);
    }
  });

  // Mutations
  const [addCommentMutation] = useMutation(ADD_COMMENT);
  const [updateCommentMutation] = useMutation(UPDATE_COMMENT);
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);
  
  // Local state for optimistic updates
  const [localComments, setLocalComments] = React.useState(new Map());

  // Build the final comments map from query data + subscription updates
  const commentsMap = React.useMemo(() => {
    const map = new Map();
    
    // Start with query data
    if (data?.comments) {
      data.comments.forEach((c) => map.set(c.commentId, c));
    }
    
    // Apply subscription updates
    if (subData?.commentEvent) {
      const { type, comment } = subData.commentEvent;
      if (type === 'ADD' || type === 'UPDATE') {
        map.set(comment.commentId, comment);
      } else if (type === 'DELETE') {
        map.delete(comment.commentId);
      }
    }
    
    // Apply local optimistic updates
    localComments.forEach((comment, id) => {
      map.set(id, comment);
    });
    
    return map;
  }, [data, subData, localComments]);

  // Action methods
  const addComment = async (range, text, author = 'Anonymous') => {
    const input = {
      text,
      author,
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      commentId: tempId,
      docId,
      text,
      author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    setLocalComments(prev => new Map(prev.set(tempId, tempComment)));

    try {
      const { data } = await addCommentMutation({
        variables: { docId, input },
        update: (cache, { data: { addComment } }) => {
          // Update the cache with the real comment
          const existingComments = cache.readQuery({
            query: GET_COMMENTS,
            variables: { docId },
          });

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: { docId },
            data: {
              comments: [...(existingComments?.comments || []), addComment],
            },
          });
        },
      });

      // Remove temp comment from local state
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      return data.addComment;
    } catch (error) {
      // Remove temp comment on error
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const updateComment = async (comment, newText) => {
    const input = {
      text: newText,
      author: comment.author,
      rangeStart: comment.rangeStart,
      rangeEnd: comment.rangeEnd,
    };

    // Optimistic update
    const updatedComment = {
      ...comment,
      text: newText,
      updatedAt: new Date().toISOString(),
    };
    setLocalComments(prev => new Map(prev.set(comment.commentId, updatedComment)));

    try {
      const { data } = await updateCommentMutation({
        variables: { docId, commentId: comment.commentId, input },
      });

      // Remove from local state since real update will come via subscription
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(comment.commentId);
        return newMap;
      });

      return data.updateComment;
    } catch (error) {
      // Revert optimistic update on error
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(comment.commentId);
        return newMap;
      });
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    // Get comment before deletion for potential rollback
    const comment = commentsMap.get(commentId);
    if (!comment) return false;

    // Optimistic update - mark as deleted in local state
    setLocalComments(prev => {
      const newMap = new Map(prev);
      newMap.set(commentId, { ...comment, _deleted: true });
      return newMap;
    });

    try {
      const { data } = await deleteCommentMutation({
        variables: { docId, commentId },
        update: (cache) => {
          // Update the cache
          const existingComments = cache.readQuery({
            query: GET_COMMENTS,
            variables: { docId },
          });

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: { docId },
            data: {
              comments: existingComments?.comments?.filter((c) => c.commentId !== commentId) || [],
            },
          });
        },
      });

      // Remove from local state since real deletion will come via subscription
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(commentId);
        return newMap;
      });

      return data.deleteComment;
    } catch (error) {
      // Restore comment on error
      setLocalComments(prev => {
        const newMap = new Map(prev);
        newMap.delete(commentId);
        return newMap;
      });
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  return {
    commentsMap,
    loading,
    reload: refetch,
    addComment,
    updateComment,
    deleteComment,
  };
}
