import { useMutation, useApolloClient } from '@apollo/client';
import { ADD_COMMENT, UPDATE_COMMENT, DELETE_COMMENT, GET_COMMENTS } from '../graphql/comments';

export const useCommentActions = (docId, commentsMap, setCommentsMap) => {
  const client = useApolloClient();

  const [addCommentMutation] = useMutation(ADD_COMMENT);
  const [updateCommentMutation] = useMutation(UPDATE_COMMENT);
  const [deleteCommentMutation] = useMutation(DELETE_COMMENT);

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

    setCommentsMap(new Map(commentsMap.set(tempId, tempComment)));

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

      // Replace temp comment with real comment
      const newMap = new Map(commentsMap);
      newMap.delete(tempId);
      newMap.set(data.addComment.commentId, data.addComment);
      setCommentsMap(newMap);

      return data.addComment;
    } catch (error) {
      // Remove temp comment on error
      const newMap = new Map(commentsMap);
      newMap.delete(tempId);
      setCommentsMap(newMap);
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
    setCommentsMap(new Map(commentsMap.set(comment.commentId, updatedComment)));

    try {
      const { data } = await updateCommentMutation({
        variables: { docId, commentId: comment.commentId, input },
      });

      // Update with server response
      setCommentsMap(new Map(commentsMap.set(comment.commentId, data.updateComment)));
      return data.updateComment;
    } catch (error) {
      // Revert optimistic update on error
      setCommentsMap(new Map(commentsMap.set(comment.commentId, comment)));
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId) => {
    // Get comment before deletion for potential rollback
    const comment = commentsMap.get(commentId);
    if (!comment) return false;

    // Optimistic update
    const newMap = new Map(commentsMap);
    newMap.delete(commentId);
    setCommentsMap(newMap);

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
              comments: existingComments?.comments?.filter(c => c.commentId !== commentId) || [],
            },
          });
        },
      });

      return data.deleteComment;
    } catch (error) {
      // Restore comment on error
      setCommentsMap(new Map(commentsMap.set(commentId, comment)));
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  return {
    addComment,
    updateComment,
    deleteComment,
  };
};
