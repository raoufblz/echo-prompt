/* Runs in every website the extension can run in
 * its role is to listen to the "insert" request and 
 * insert the prompt content in the active input element
 */

// We register a listner for messages coming from the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // The message we re waiting for is the insert button
    if (request.action === "insertPrompt") {
        try {
            insertTextIntoActiveElement(request.content);
            sendResponse({success: true});
        } catch (error) {
            console.error("Failed to insert prompt:", error);
            sendResponse({success: false});
        }
        return true;
    }
});

// Insert text where the user is typing (active element)
function insertTextIntoActiveElement(text) {
    let activeElement = document.activeElement;
    
    // If the user isn t focused on a typing element, we try common selectors
    if (!activeElement || 
        (!activeElement.isContentEditable && 
         activeElement.tagName !== 'TEXTAREA' && 
         activeElement.tagName !== 'INPUT')) {
        
        // Look for common chat input selectors
        const selectors = [
            'textarea', 
            'input', 
            '[contenteditable="true"]', 
            '.chat-input', 
            '[role="textbox"]',
            '.chat-input-textarea',
            '.input-area',
            'textarea.ql-editor',
            '.ql-editor'
        ];
        
        // until match found
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                activeElement = element;
                element.focus();
                break;
            }
        }
    }

    // Nothing found? We ll just copy it
    if (!activeElement) {
        navigator.clipboard.writeText(text);
        return;
    }

    // Some react related stuff so it thinks we re really typing (idk react)
    const dispatchEvents = (element) => {
        ['input', 'change', 'keydown', 'keyup', 'keypress'].forEach(eventType => {
            element.dispatchEvent(new Event(eventType, {
                bubbles: true,
                cancelable: true
            }));
        });
    };

    // <textarea> <input type ="text">
    if (activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'INPUT') {
        
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        // Splice text into the existent value
        activeElement.value = activeElement.value.substring(0, start) + 
                             text + 
                             activeElement.value.substring(end);
        
        // Moving the cursor "|" to the end of the inserted text
        activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
        
        // Dispatch input event (for react, vue...)
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        });
        
        activeElement.dispatchEvent(inputEvent);
        dispatchEvents(activeElement);
    } 
    // Content editable divs
    else if (activeElement.isContentEditable) {
        try {
            document.execCommand('insertText', false, text);
        } catch (e) {
            // If execCommand is blocked, we ll manually insert a text node
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(activeElement);  // Select editable area
            range.collapse(false);                   // Collapse to the end
            selection.removeAllRanges();            // Clear existing selection
            selection.addRange(range);
            // Insert text node sfter the cursor "|"
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        }
        
        // Same events so frameworks (react, vue...) stay in sync
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        });
        
        activeElement.dispatchEvent(inputEvent);
        dispatchEvents(activeElement);
    } else {
        // We just copy it
        navigator.clipboard.writeText(text);
    }
}
