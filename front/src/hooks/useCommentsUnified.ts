import React from 'react';
import {  useQuery, useSubscription, useMutation } from '@apollo/client';
import {ADD_COMMENT, DELETE_COMMENT, GET_COMMENTS, COMMENT_EVENTS} from "../graphql/comments";


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
  const { data, loading, client } = useQuery(GET_COMMENTS, {
    variables: { docId },
    fetchPolicy: 'cache-and-network',
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
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);
  
  // Effect to update Apollo Cache based on subscription events
  React.useEffect(() => {
    if (subData?.commentEvent && client) {
      const { type, comment: incomingComment, docId: eventDocId } = subData.commentEvent;
      
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
      } catch (e) {
        console.warn(`[useCommentsUnified] (${docId}) Could not read query from cache before subscription update (this might be normal if cache is empty):`, e);
      }

      let newCommentsArray: Comment[] = existingQueryData?.comments ? [...existingQueryData.comments] : [];
      let changed = false;

      if (type === 'ADD') {
        if (!newCommentsArray.find(c => c.commentId === incomingComment.commentId)) {
          newCommentsArray.push(incomingComment);
          changed = true;
        } 
      } else if (type === 'DELETE') {
        const initialLength = newCommentsArray.length;
        newCommentsArray = newCommentsArray.filter(
          c => c.commentId !== incomingComment.commentId
        );

        changed = newCommentsArray.length !== initialLength;
      }

      if (changed) {
        client.writeQuery({
          query: GET_COMMENTS,
          variables: { docId }, // Ensure this docId matches
          data: { comments: newCommentsArray },
        });
      }
    }
  }, [subData, docId, client]); 

  // Build the final comments map from query data
  const commentsMap = React.useMemo(() => {
    const map = new Map<string, Comment>();
    
    if (data?.comments) {
      data.comments.forEach((c: Comment) => map.set(c.commentId, c));
    }
    
    return map;
  }, [data]); 

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
    commentsMap,
    addComment,
    deleteComment,
  };
}
