// Simple test to check Apollo Client connection
import { ApolloClient, InMemoryCache, HttpLink, gql } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:3000/graphql",
  }),
  cache: new InMemoryCache(),
});

// Simple test query
const TEST_QUERY = gql`
  query TestConnection {
    __schema {
      types {
        name
      }
    }
  }
`;

export async function testConnection() {
  try {
    console.log("Testing Apollo Client connection...");
    const result = await client.query({
      query: TEST_QUERY,
    });
    console.log("✅ Apollo Client connection successful!", result);
    return true;
  } catch (error) {
    console.error("❌ Apollo Client connection failed:", error);
    return false;
  }
}

// Test the GET_COMMENTS query specifically
const GET_COMMENTS = gql`
  query GetComments($docId: String!) {
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

export async function testGetComments() {
  try {
    console.log("Testing GET_COMMENTS query...");
    const result = await client.query({
      query: GET_COMMENTS,
      variables: { docId: "test-doc" },
    });
    console.log("✅ GET_COMMENTS query successful!", result);
    return true;
  } catch (error) {
    console.error("❌ GET_COMMENTS query failed:", error);
    return false;
  }
}
