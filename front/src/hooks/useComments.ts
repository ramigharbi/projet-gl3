import React from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';

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

export function useComments(docId) {
  const { data, loading, refetch } = useQuery(GET_COMMENTS, { variables: { docId } });
  const { data: subData } = useSubscription(COMMENT_EVENTS, { variables: { docId } });

  const commentsMap = React.useMemo(() => {
    const map = new Map();
    if (data?.comments) {
      data.comments.forEach(c => map.set(c.commentId, c));
    }
    if (subData?.commentEvent) {
      const { type, comment } = subData.commentEvent;
      if (type === 'ADD' || type === 'UPDATE') {
        map.set(comment.commentId, comment);
      }
    }
    return map;
  }, [data, subData]);

  return { commentsMap, loading, reload: refetch };
}
