import { gql } from '@apollo/client';

// Query to get all comments for a document
export const GET_COMMENTS = gql`
  query GetComments($docId: ID!) {
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

// Mutation to update an existing comment
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

// Mutation to delete a comment
export const DELETE_COMMENT = gql`
  mutation DeleteComment($docId: ID!, $commentId: ID!) {
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
      docId # Ensure this field is queried
      commentId # This was present in your original file, ensure it's intended here at this level
    }
  }
`;
