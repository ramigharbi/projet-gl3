import React from 'react';
import { gql, useQuery, useSubscription, useMutation } from '@apollo/client';

// GraphQL Queries and Subscriptions
export const GET_COMMENTS = gql`
  query GetComments($docId: String!) { # Changed ID! to String!
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
  subscription CommentEvent($docId: String!) { # Already String!
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
      docId # Added docId here as per backend DTO
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation AddComment($docId: String!, $input: CommentInput!) {
    addComment(docId: $docId, input: $input) {
      comment {
        commentId
        docId
        text
        author
        createdAt
        updatedAt
        rangeStart
        rangeEnd
      }
      message
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($docId: String!, $commentId: ID!, $input: CommentInput!) { # Changed ID! to String!
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
  mutation DeleteComment($docId: String!, $commentId: ID!) { # Changed ID! to String!
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
  const { data, loading, refetch, client } = useQuery(GET_COMMENTS, {
    variables: { docId },
    fetchPolicy: 'cache-and-network',
    // notifyOnNetworkStatusChange: true, // Might be useful for debugging loading states
  });

  // Subscribe to real-time comment events
  const { data: subData } = useSubscription(COMMENT_EVENTS, {
    variables: { docId },
    onError: (error) => {
      console.warn(`[useCommentsUnified] (${docId}) Comment subscription error:`, error);
    }
  });

  // Mutations
  const [addCommentMutation] = useMutation(ADD_COMMENT);
  const [updateCommentMutation] = useMutation(UPDATE_COMMENT);
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);
  // REMOVE Local state for optimistic updates
  // const [localComments, setLocalComments] = React.useState(new Map<string, Comment>());

  // Effect to update Apollo Cache based on subscription events
  React.useEffect(() => {
    if (subData?.commentEvent && client) {
      // Enhanced logging for incoming subscription data
      console.log(`[useCommentsUnified] (${docId}) RAW SUB DATA RECEIVED:`, JSON.stringify(subData));
      
      const { type, comment: incomingComment, docId: eventDocId, commentId: eventTopLevelCommentId } = subData.commentEvent;
      console.log(`[useCommentsUnified] (${docId}) Subscription event processed. Type: ${type}, Comment ID (from comment object): ${incomingComment?.commentId}, Comment ID (from event top level): ${eventTopLevelCommentId}, Event's DocID: ${eventDocId}`);

      // Ensure incomingComment is not null before proceeding
      if (!incomingComment) {
        console.warn(`[useCommentsUnified] (${docId}) Received subscription event with null comment object. Type: ${type}, Event DocID: ${eventDocId}`);
        return;
      }
      
      // Read current comments from cache
      let existingQueryData: { comments: Comment[] } | null = null;
      try {
        existingQueryData = client.readQuery({
          query: GET_COMMENTS,
          variables: { docId }, // Ensure this docId matches the event's scope
        });
        console.log(`[useCommentsUnified] (${docId}) Existing cache data before sub update. Count: ${existingQueryData?.comments?.length || 0}`, existingQueryData?.comments ? JSON.stringify(existingQueryData.comments) : 'No existing comments');
      } catch (e) {
        console.warn(`[useCommentsUnified] (${docId}) Could not read query from cache before subscription update (this might be normal if cache is empty):`, e);
      }

      let newCommentsArray: Comment[] = existingQueryData?.comments ? [...existingQueryData.comments] : [];
      let changed = false;

      if (type === 'ADD') {
        if (!newCommentsArray.find(c => c.commentId === incomingComment.commentId)) {
          newCommentsArray.push(incomingComment);
          changed = true;
          console.log(`[useCommentsUnified] (${docId}) Cache Update: ADDING comment ${incomingComment.commentId}`);
        } else {
          console.log(`[useCommentsUnified] (${docId}) Cache Info: ADD event for existing comment ${incomingComment.commentId} (likely echo or already processed). No change to array.`);
        }
      } else if (type === 'UPDATE') {
        const index = newCommentsArray.findIndex(c => c.commentId === incomingComment.commentId);
        if (index !== -1) {
          if (JSON.stringify(newCommentsArray[index]) !== JSON.stringify(incomingComment)) {
            newCommentsArray[index] = incomingComment;
            changed = true;
            console.log(`[useCommentsUnified] (${docId}) Cache Update: UPDATING comment ${incomingComment.commentId}`);
          } else {
            console.log(`[useCommentsUnified] (${docId}) Cache Info: UPDATE event for comment ${incomingComment.commentId} with no actual data change. No change to array.`);
          }
        } else {
          // If an UPDATE event comes for a comment not in cache, it's effectively an ADD.
          newCommentsArray.push(incomingComment);
          changed = true;
          console.log(`[useCommentsUnified] (${docId}) Cache Update: UPDATE event for non-existing comment ${incomingComment.commentId}, ADDING it.`);
        }
      } else if (type === 'DELETE') {
        const initialLength = newCommentsArray.length;
        newCommentsArray = newCommentsArray.filter(
          c => c.commentId !== incomingComment.commentId
        );
        if (newCommentsArray.length !== initialLength) {
          changed = true;
          console.log(`[useCommentsUnified] (${docId}) Cache Update: DELETING comment ${incomingComment.commentId}`);
        } else {
           console.log(`[useCommentsUnified] (${docId}) Cache Info: DELETE event for non-existing comment ${incomingComment.commentId}. No change to array.`);
        }
      }

      if (changed) {
        console.log(`[useCommentsUnified] (${docId}) Cache: Writing updated comments. New count: ${newCommentsArray.length}`, JSON.stringify(newCommentsArray));
        client.writeQuery({
          query: GET_COMMENTS,
          variables: { docId }, // Ensure this docId matches
          data: { comments: newCommentsArray },
        });
        // Log cache state after write
        try {
          const updatedCacheData: { comments: Comment[] } | null = client.readQuery({ query: GET_COMMENTS, variables: { docId } });
          console.log(`[useCommentsUnified] (${docId}) Cache data after write:`, updatedCacheData ? JSON.stringify(updatedCacheData.comments) : 'Cache empty after write');
        } catch (e) {
          console.warn(`[useCommentsUnified] (${docId}) Could not read cache after write:`, e);
        }
      } else {
        console.log(`[useCommentsUnified] (${docId}) No effective change from subscription event, not writing to cache.`);
      }
    }
  }, [subData, docId, client]); 

  // Build the final comments map from query data
  const commentsMap = React.useMemo(() => {
    console.log(`[useCommentsUnified] (${docId}) Recomputing commentsMap. Current 'data.comments' count from useQuery: ${data?.comments?.length || 0}.`);
    const map = new Map<string, Comment>();
    
    if (data?.comments) {
      data.comments.forEach((c: Comment) => map.set(c.commentId, c));
    }
    
    console.log(`[useCommentsUnified] (${docId}) Final commentsMap computed. Size: ${map.size}`, Array.from(map.values()));
    return map;
  }, [data, docId]); 

  // Action methods
  const addComment = async (range: Range, text: string, author: string = 'Anonymous') => {
    const input = {
      text,
      author,
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    const tempId = `temp-${Date.now()}`;

    try {
      const { data: addCommentData } = await addCommentMutation({
        variables: { docId, input },
        optimisticResponse: {
          addComment: {
            __typename: 'CommentPayload',
            comment: {
              __typename: 'Comment',
              commentId: tempId,
              docId,
              author: input.author,
              text: input.text,
              rangeStart: input.rangeStart,
              rangeEnd: input.rangeEnd,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            message: 'Optimistic add',
          },
        },
        update: (cache, { data: mutationResult }) => {
          if (!mutationResult || !mutationResult.addComment || !mutationResult.addComment.comment) return;
          const newComment = mutationResult.addComment.comment;
          const queryOptions = { query: GET_COMMENTS, variables: { docId } };
          const existingCommentsData = cache.readQuery<{ comments: Comment[] }>(queryOptions);
          let updatedComments = existingCommentsData?.comments ? [...existingCommentsData.comments] : [];

          if (newComment.commentId !== tempId) {
            updatedComments = updatedComments.filter(c => c.commentId !== tempId);
          }

          const commentIndex = updatedComments.findIndex(c => c.commentId === newComment.commentId);
          if (commentIndex > -1) {
            updatedComments[commentIndex] = newComment;
          } else {
            updatedComments.push(newComment);
          }
          cache.writeQuery({
            ...queryOptions,
            data: { comments: updatedComments },
          });
        },
      });
      return addCommentData.addComment.comment;
    } catch (error) {
      throw error;
    }
  };

  const updateComment = async (commentId: string, range: Range, text: string, author?: string) => {
    const input = {
      text,
      author,
      rangeStart: range.start,
      rangeEnd: range.end,
    };

    try {
      const { data: updateCommentData } = await updateCommentMutation({
        variables: { docId, commentId, input },
        optimisticResponse: {
          updateComment: {
            __typename: 'CommentPayload',
            comment: {
              __typename: 'Comment',
              commentId,
              docId,
              author: author || 'Anonymous',
              text,
              rangeStart: range.start,
              rangeEnd: range.end,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            message: 'Optimistic update',
          },
        },
        update: (cache, { data: mutationResult }) => {
          if (!mutationResult || !mutationResult.updateComment || !mutationResult.updateComment.comment) return;
          const updatedComment = mutationResult.updateComment.comment;
          const queryOptions = { query: GET_COMMENTS, variables: { docId } };
          const existingCommentsData = cache.readQuery<{ comments: Comment[] }>(queryOptions);
          let updatedComments = existingCommentsData?.comments ? [...existingCommentsData.comments] : [];

          const commentIndex = updatedComments.findIndex(c => c.commentId === updatedComment.commentId);
          if (commentIndex > -1) {
            updatedComments[commentIndex] = updatedComment;
          } else {
            updatedComments.push(updatedComment);
          }
          cache.writeQuery({
            ...queryOptions,
            data: { comments: updatedComments },
          });
        },
      });
      return updateCommentData.updateComment.comment;
    } catch (error) {
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation({
        variables: { docId, commentId },
        optimisticResponse: {
          deleteComment: true,
        },
        update: (cache) => {
          const queryOptions = { query: GET_COMMENTS, variables: { docId } };
          const existingCommentsData = cache.readQuery<{ comments: Comment[] }>(queryOptions);
          let updatedComments = existingCommentsData?.comments ? [...existingCommentsData.comments] : [];

          updatedComments = updatedComments.filter(c => c.commentId !== commentId);
          cache.writeQuery({
            ...queryOptions,
            data: { comments: updatedComments },
          });
        },
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    loading,
    comments: commentsMap,
    refetchComments: refetch,
    addComment,
    updateComment,
    deleteComment,
  };
}
