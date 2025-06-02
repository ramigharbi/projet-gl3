import { ApolloClient, InMemoryCache, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from "@apollo/client/link/error";

// GraphQL URLs
const GRAPHQL_HTTP_URL = process.env.REACT_APP_GRAPHQL_HTTP_URL || 'http://localhost:3000/graphql';
const GRAPHQL_WS_URL = process.env.REACT_APP_GRAPHQL_WS_URL || 'ws://localhost:3000/graphql';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({ 
  uri: GRAPHQL_HTTP_URL,
  credentials: 'include'
});

const wsLink = new GraphQLWsLink(createClient({
  url: GRAPHQL_WS_URL,
  connectionParams: {
    // Add auth token if needed
    authToken: localStorage.getItem('token') || sessionStorage.getItem('token'),
  },
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          comments: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
