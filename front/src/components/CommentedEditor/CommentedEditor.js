import React, { useState, useEffect, useRef } from 'react';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { useQuery } from '@apollo/client';
import { createCommentPlugin, commentStyles, updateCommentPlugin } from '../../plugins/commentPlugin';
import { useCommentActions } from '../../hooks/useCommentActions';
import { GET_COMMENTS } from '../../graphql/comments';

// Inject comment styles
if (typeof document !== 'undefined' && !document.getElementById('comment-styles')) {
  const style = document.createElement('style');
  style.id = 'comment-styles';
  style.textContent = commentStyles;
  document.head.appendChild(style);
}

export default function CommentedEditor({ docId = 'default-doc' }) {
  const [commentsMap, setCommentsMap] = useState(new Map());
  const [selectedRange, setSelectedRange] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const editorRef = useRef(null);

  // Load comments from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    variables: { docId },
    fetchPolicy: 'cache-and-network',
  });

  // Comment actions
  const { addComment, updateComment, deleteComment } = useCommentActions(
    docId,
    commentsMap,
    setCommentsMap
  );

  // Update comments map when data changes
  useEffect(() => {
    if (data?.comments) {
      const newMap = new Map();
      data.comments.forEach(comment => {
        newMap.set(comment.commentId, comment);
      });
      setCommentsMap(newMap);
    }
  }, [data]);

  // Create the editor with comment plugin
  const editor = useCreateBlockNote({
    prosemirrorPlugins: [createCommentPlugin(commentsMap)],
  });

  // Update plugin when comments change
  useEffect(() => {
    if (editorRef.current && editorRef.current.proseMirrorView) {
      updateCommentPlugin(editorRef.current.proseMirrorView, commentsMap);
    }
  }, [commentsMap]);

  // Handle comment clicks
  useEffect(() => {
    const handleCommentClick = (event) => {
      const { commentId } = event.detail;
      const comment = commentsMap.get(commentId);
      if (comment) {
        alert(`Comment by ${comment.author}: ${comment.text}`);
      }
    };

    document.addEventListener('comment-click', handleCommentClick);
    return () => {
      document.removeEventListener('comment-click', handleCommentClick);
    };
  }, [commentsMap]);

  // Handle text selection for adding comments
  const handleSelectionChange = () => {
    if (!editorRef.current?.proseMirrorView) return;

    const { state } = editorRef.current.proseMirrorView;
    const { from, to } = state.selection;

    if (from !== to) {
      setSelectedRange({ start: from, end: to });
    } else {
      setSelectedRange(null);
      setShowCommentForm(false);
    }
  };

  const handleAddComment = async (text, author) => {
    if (!selectedRange) return;

    try {
      await addComment(selectedRange, text, author);
      setShowCommentForm(false);
      setSelectedRange(null);
    } catch (error) {
      alert('Failed to add comment: ' + error.message);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments: {error.message}</div>;

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <h3>Document Editor with Comments</h3>
        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          disabled={!selectedRange}
          style={{
            padding: '5px 10px',
            backgroundColor: selectedRange ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedRange ? 'pointer' : 'not-allowed'
          }}
        >
          Add Comment {selectedRange ? `(${selectedRange.end - selectedRange.start} chars)` : ''}
        </button>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {commentsMap.size} comments
        </span>
      </div>

      {showCommentForm && selectedRange && (
        <CommentForm
          onSubmit={handleAddComment}
          onCancel={() => {
            setShowCommentForm(false);
            setSelectedRange(null);
          }}
        />
      )}

      <div
        ref={editorRef}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
      >
        <BlockNoteView editor={editor} />
      </div>

      <CommentsPanel
        comments={Array.from(commentsMap.values())}
        onUpdateComment={updateComment}
        onDeleteComment={deleteComment}
      />
    </div>
  );
}

// Comment form component
function CommentForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('Anonymous');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), author.trim() || 'Anonymous');
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      border: '1px solid #ddd',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ padding: '4px 8px', marginRight: '8px', width: '120px' }}
        />
      </div>
      <div style={{ marginBottom: '8px' }}>
        <textarea
          placeholder="Add your comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '8px', resize: 'vertical' }}
        />
      </div>
      <div>
        <button type="submit" style={{ marginRight: '8px', padding: '4px 12px' }}>
          Add Comment
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '4px 12px' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Comments panel component
function CommentsPanel({ comments, onUpdateComment, onDeleteComment }) {
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const startEditing = (comment) => {
    setEditingComment(comment.commentId);
    setEditText(comment.text);
  };

  const saveEdit = async () => {
    if (editingComment && editText.trim()) {
      const comment = comments.find(c => c.commentId === editingComment);
      try {
        await onUpdateComment(comment, editText.trim());
        setEditingComment(null);
        setEditText('');
      } catch (error) {
        alert('Failed to update comment: ' + error.message);
      }
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  return (
    <div style={{
      marginTop: '20px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <h4 style={{ padding: '10px', margin: 0, backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        Comments ({comments.length})
      </h4>
      {comments.length === 0 ? (
        <p style={{ padding: '20px', margin: 0, textAlign: 'center', color: '#666' }}>
          No comments yet. Select text and click "Add Comment" to get started.
        </p>
      ) : (
        comments.map(comment => (
          <div key={comment.commentId} style={{
            padding: '10px',
            borderBottom: '1px solid #eee',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <strong>{comment.author}</strong>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                  Range: {comment.rangeStart}-{comment.rangeEnd}
                </div>
                {editingComment === comment.commentId ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '4px', marginBottom: '8px' }}
                    />
                    <button onClick={saveEdit} style={{ marginRight: '8px', padding: '2px 8px' }}>
                      Save
                    </button>
                    <button onClick={cancelEdit} style={{ padding: '2px 8px' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: '4px 0' }}>{comment.text}</p>
                )}
              </div>
              {editingComment !== comment.commentId && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => startEditing(comment)}
                    style={{ padding: '2px 6px', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this comment?')) {
                        onDeleteComment(comment.commentId);
                      }
                    }}
                    style={{ padding: '2px 6px', fontSize: '12px', backgroundColor: '#f44336', color: 'white' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
