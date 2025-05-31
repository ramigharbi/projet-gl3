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

interface Comment {
  commentId: string;
  docId: string;
  author: string;
  text: string;
  rangeStart: number;
  rangeEnd: number;
  createdAt: string;
  updatedAt: string;
}

interface Range {
  start: number;
  end: number;
}

/**
 * Unified hook that combines real-time comment subscriptions with action methods
 * Provides both the live comment map and methods to manipulate comments
 */
export function useCommentsUnified(docId: string) {
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
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);  // Local state for optimistic updates
  const [localComments, setLocalComments] = React.useState(new Map<string, Comment>());

  // Build the final comments map from query data + subscription updates
  const commentsMap = React.useMemo(() => {
    const map = new Map<string, Comment>();
    
    // Start with query data
    if (data?.comments) {
      data.comments.forEach((c: Comment) => map.set(c.commentId, c));
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
    localComments.forEach((comment: Comment, id: string) => {
      map.set(id, comment);
    });
    
    return map;
  }, [data, subData, localComments]);

  // Action methods
  const addComment = async (range: Range, text: string, author: string = 'Anonymous') => {
    const input = {
      text,
      author,
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      commentId: tempId,
      docId,
      text,
      author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    setLocalComments((prev: Map<string, Comment>) => new Map(prev.set(tempId, tempComment)));

    try {
      const { data } = await addCommentMutation({
        variables: { docId, input },        update: (cache, { data: { addComment } }) => {
          // Update the cache with the real comment
          const existingComments: any = cache.readQuery({
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
      });      // Remove temp comment from local state
      setLocalComments((prev: Map<string, Comment>) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      return data.addComment;
    } catch (error) {      // Remove temp comment on error
      setLocalComments((prev: Map<string, Comment>) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const updateComment = async (comment: Comment, newText: string) => {
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
    setLocalComments((prev: Map<string, Comment>) => new Map(prev.set(comment.commentId, updatedComment)));

    try {
      const { data } = await updateCommentMutation({
        variables: { docId, commentId: comment.commentId, input },
      });      // Remove from local state once server confirms
      setLocalComments((prev: Map<string, Comment>) => {
        const newMap = new Map(prev);
        newMap.delete(comment.commentId);
        return newMap;
      });

      return data.updateComment;
    } catch (error) {      // Revert optimistic update on error
      setLocalComments((prev: Map<string, Comment>) => {
        const newMap = new Map(prev);
        newMap.delete(comment.commentId);
        return newMap;
      });
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { data } = await deleteCommentMutation({
        variables: { docId, commentId },        update: (cache) => {
          // Update the cache
          const existingComments: any = cache.readQuery({
            query: GET_COMMENTS,
            variables: { docId },
          });

          cache.writeQuery({
            query: GET_COMMENTS,
            variables: { docId },
            data: {
              comments: existingComments?.comments?.filter((c: Comment) => c.commentId !== commentId) || [],
            },
          });
        },
      });

      return data.deleteComment;
    } catch (error) {
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
