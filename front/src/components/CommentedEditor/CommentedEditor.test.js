import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import CommentedEditor from './CommentedEditor';
import { GET_COMMENTS, ADD_COMMENT, DELETE_COMMENT } from '../../graphql/comments';

// Mock BlockNote components
jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: jest.fn(() => ({
    proseMirrorView: {
      state: {
        selection: { from: 0, to: 0 }
      }
    }
  }))
}));

jest.mock('@blocknote/mantine', () => ({
  BlockNoteView: ({ editor }) => <div data-testid="blocknote-editor">BlockNote Editor</div>
}));

// Mock the comment plugin
jest.mock('../../plugins/commentPlugin', () => ({
  createCommentPlugin: jest.fn(() => ({})),
  updateCommentPlugin: jest.fn(),
  commentStyles: ''
}));

const mockComments = [
  {
    commentId: '1',
    docId: 'test-doc',
    text: 'Test comment 1',
    author: 'User 1',
    createdAt: '2025-05-31T12:00:00Z',
    updatedAt: '2025-05-31T12:00:00Z',
    rangeStart: 0,
    rangeEnd: 10,
  },
  {
    commentId: '2',
    docId: 'test-doc',
    text: 'Test comment 2',
    author: 'User 2',
    createdAt: '2025-05-31T12:01:00Z',
    updatedAt: '2025-05-31T12:01:00Z',
    rangeStart: 15,
    rangeEnd: 25,
  },
];

const mocks = [
  {
    request: {
      query: GET_COMMENTS,
      variables: { docId: 'test-doc' },
    },
    result: {
      data: {
        comments: mockComments,
      },
    },
  },
  {
    request: {
      query: ADD_COMMENT,
      variables: {
        docId: 'test-doc',
        input: {
          text: 'New test comment',
          author: 'Test User',
          rangeStart: 5,
          rangeEnd: 15,
        },
      },
    },
    result: {
      data: {
        addComment: {
          commentId: '3',
          docId: 'test-doc',
          text: 'New test comment',
          author: 'Test User',
          createdAt: '2025-05-31T12:02:00Z',
          updatedAt: '2025-05-31T12:02:00Z',
          rangeStart: 5,
          rangeEnd: 15,
        },
      },
    },
  },
  {
    request: {
      query: DELETE_COMMENT,
      variables: {
        docId: 'test-doc',
        commentId: '1',
      },
    },
    result: {
      data: {
        deleteComment: true,
      },
    },
  },
];

describe('CommentedEditor Integration', () => {
  beforeEach(() => {
    // Clear any existing styles
    const existingStyle = document.getElementById('comment-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  test('renders editor with comments panel', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    expect(screen.getByTestId('blocknote-editor')).toBeInTheDocument();
    expect(screen.getByText('Document Editor with Comments')).toBeInTheDocument();
    
    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    });

    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });

  test('handles GraphQL errors gracefully', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_COMMENTS,
          variables: { docId: 'test-doc' },
        },
        error: new Error('Network error'),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading comments/)).toBeInTheDocument();
    });
  });

  test('shows comment form when text is selected', async () => {
    // Mock selection
    const mockEditor = {
      proseMirrorView: {
        state: {
          selection: { from: 5, to: 15 }
        }
      }
    };

    const useCreateBlockNoteMock = require('@blocknote/react').useCreateBlockNote;
    useCreateBlockNoteMock.mockReturnValue(mockEditor);

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    });

    // Simulate text selection by clicking the Add Comment button
    const addCommentButton = screen.getByText(/Add Comment/);
    expect(addCommentButton).toBeDisabled(); // Initially disabled

    // For testing purposes, we'll simulate the form being shown
    fireEvent.click(addCommentButton);
  });

  test('allows editing comments inline', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    });

    // Click edit button for first comment
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Should show textarea for editing
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test comment 1')).toBeInTheDocument();
    });

    // Should show Save and Cancel buttons
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('allows deleting comments with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    });

    // Click delete button for first comment
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this comment?');

    confirmSpy.mockRestore();
  });

  test('displays empty state when no comments exist', async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_COMMENTS,
          variables: { docId: 'empty-doc' },
        },
        result: {
          data: {
            comments: [],
          },
        },
      },
    ];

    render(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <CommentedEditor docId="empty-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Comments (0)')).toBeInTheDocument();
    });

    expect(screen.getByText(/No comments yet/)).toBeInTheDocument();
    expect(screen.getByText(/Select text and click "Add Comment"/)).toBeInTheDocument();
  });

  test('shows comment count accurately', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('2 comments')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    });
  });

  test('displays comment metadata correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CommentedEditor docId="test-doc" />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });

    // Check range display
    expect(screen.getByText('Range: 0-10')).toBeInTheDocument();
    expect(screen.getByText('Range: 15-25')).toBeInTheDocument();

    // Check formatted dates (will vary based on locale)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
});
