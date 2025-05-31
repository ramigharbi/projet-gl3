import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const commentPluginKey = new PluginKey('comments');

export const createCommentPlugin = (commentsMap) => {
  return new Plugin({
    key: commentPluginKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, oldState) {
        // Update decorations when document changes
        let decorations = oldState.map(tr.mapping, tr.doc);
        
        // Create decorations for each comment
        const decorationsArray = [];
        
        if (commentsMap) {
          commentsMap.forEach((comment) => {
            try {
              const from = Math.min(comment.rangeStart, tr.doc.content.size);
              const to = Math.min(comment.rangeEnd, tr.doc.content.size);
              
              if (from < to && from >= 0) {
                const decoration = Decoration.inline(from, to, {
                  class: `comment-highlight comment-${comment.commentId}`,
                  style: 'background-color: rgba(255, 235, 59, 0.3); border-bottom: 2px solid #ffeb3b;',
                  title: `${comment.author}: ${comment.text}`,
                  'data-comment-id': comment.commentId,
                });
                
                decorationsArray.push(decoration);
              }
            } catch (error) {
              console.warn('Error creating decoration for comment:', comment.commentId, error);
            }
          });
        }
        
        return DecorationSet.create(tr.doc, decorationsArray);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
      handleDOMEvents: {
        click(view, event) {
          const target = event.target;
          const commentId = target.getAttribute('data-comment-id');
          
          if (commentId) {
            // Emit custom event for comment click
            const commentClickEvent = new CustomEvent('comment-click', {
              detail: { commentId, view, event }
            });
            document.dispatchEvent(commentClickEvent);
            return true;
          }
          return false;
        },
      },
    },
  });
};

// Helper function to update the plugin with new comments
export const updateCommentPlugin = (view, commentsMap) => {
  if (!view || !view.state) return;
  
  const plugin = commentPluginKey.get(view.state);
  if (plugin) {
    // Trigger a state update to refresh decorations
    const tr = view.state.tr;
    view.dispatch(tr);
  }
};

// CSS styles for comment highlights
export const commentStyles = `
  .comment-highlight {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .comment-highlight:hover {
    background-color: rgba(255, 235, 59, 0.5) !important;
  }
  
  .comment-tooltip {
    position: absolute;
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    max-width: 200px;
    z-index: 1000;
    pointer-events: none;
    white-space: pre-wrap;
  }
  
  .comment-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border: 5px solid transparent;
    border-top-color: #333;
  }
`;
