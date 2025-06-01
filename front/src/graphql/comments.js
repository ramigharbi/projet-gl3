// GraphQL Queries and Subscriptions
import { gql } from '@apollo/client';


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


export const DELETE_COMMENT = gql`
  mutation DeleteComment($docId: String!, $commentId: String!) {
    deleteComment(docId: $docId, commentId: $commentId){
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