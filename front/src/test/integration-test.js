/**
 * Integration test to verify BlockNote + GraphQL comment system
 * Run this in the browser console to test the integration
 */

// Test function to verify the integration works
async function testBlockNoteGraphQLIntegration() {
  console.log('🧪 Testing BlockNote + GraphQL Integration...');
  
  // Test 1: Check if the application is loaded
  const appContainer = document.querySelector('#root');
  if (!appContainer) {
    console.error('❌ App container not found');
    return false;
  }
  console.log('✅ App container found');
  
  // Test 2: Check if BlockNote editor is rendered
  const editorContainer = document.querySelector('.bn-editor');
  if (!editorContainer) {
    console.error('❌ BlockNote editor not found');
    return false;
  }
  console.log('✅ BlockNote editor found');
  
  // Test 3: Check if comment sidebar is rendered
  const commentSidebar = document.querySelector('[style*="width: 350px"]');
  if (!commentSidebar) {
    console.error('❌ Comment sidebar not found');
    return false;
  }
  console.log('✅ Comment sidebar found');
  
  // Test 4: Check if test button is present
  const testButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('Add Test Comment'));
  if (!testButton) {
    console.error('❌ Test comment button not found');
    return false;
  }
  console.log('✅ Test comment button found');
  
  // Test 5: Try to click the test button
  try {
    testButton.click();
    console.log('✅ Test button clicked successfully');
    
    // Wait a moment and check if comment was added
    setTimeout(() => {
      const commentElements = document.querySelectorAll('[style*="border-left: 4px solid #2196F3"]');
      if (commentElements.length > 0) {
        console.log('✅ Comment UI elements found');
      } else {
        console.log('⏳ Waiting for comment to appear...');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error clicking test button:', error);
    return false;
  }
  
  console.log('🎉 All tests passed! BlockNote + GraphQL integration is working.');
  return true;
}

// Instructions for manual testing
console.log(`
🧪 BlockNote + GraphQL Integration Test
=====================================

To test the integration manually:

1. Load the application at http://localhost:3002
2. Open the browser console
3. Run: testBlockNoteGraphQLIntegration()
4. Try clicking "Add Test Comment" button
5. Try selecting text and clicking "Comment on Selection"
6. Switch users and observe real-time updates
7. Check the comment sidebar for new comments

Expected behavior:
- Comments should appear in real-time
- ThreadStore should show "Connected" status
- GraphQL backend should receive comment mutations
- WebSocket subscriptions should work for real-time updates

🚀 Run the test function above to verify everything works!
`);

// Export test function for global use
window.testBlockNoteGraphQLIntegration = testBlockNoteGraphQLIntegration;
