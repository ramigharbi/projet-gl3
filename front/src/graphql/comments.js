// GraphQL Queries and Subscriptions
const GET_COMMENTS = gql`
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

const COMMENT_EVENTS = gql`
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

const ADD_COMMENT = gql`
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


const DELETE_COMMENT = gql`
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


export default{
  GET_COMMENTS,
  COMMENT_EVENTS,
  ADD_COMMENT,
  DELETE_COMMENT
}