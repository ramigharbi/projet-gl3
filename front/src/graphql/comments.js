import { gql } from '@apollo/client';

// Query to get all comments for a document
export const GET_COMMENTS = gql`
  query GetComments($docId: String!) {
    comments(docId: $docId) {
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

// Mutation to add a new comment
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

// Mutation to update an existing comment
export const UPDATE_COMMENT = gql`
  mutation UpdateComment($docId: String!, $commentId: String!, $input: CommentInput!) {
    updateComment(docId: $docId, commentId: $commentId, input: $input) {
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

// Mutation to delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($docId: String!, $commentId: String!) {
    deleteComment(docId: $docId, commentId: $commentId)
  }
`;

// Subscription to listen for comment events
export const COMMENT_EVENTS = gql`
  subscription CommentEvent($docId: String!) {
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
      docId
      commentId
    }
  }
`;
