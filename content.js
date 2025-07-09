chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

function insertTextIntoActiveElement(text) {
    let activeElement = document.activeElement;
    
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
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                activeElement = element;
                element.focus();
                break;
            }
        }
    }

    if (!activeElement) {
        navigator.clipboard.writeText(text);
        return;
    }

    const dispatchEvents = (element) => {
        ['input', 'change', 'keydown', 'keyup', 'keypress'].forEach(eventType => {
            element.dispatchEvent(new Event(eventType, {
                bubbles: true,
                cancelable: true
            }));
        });
    };

    if (activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'INPUT') {
        
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        activeElement.value = activeElement.value.substring(0, start) + 
                             text + 
                             activeElement.value.substring(end);
        
        activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
        
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        });
        
        activeElement.dispatchEvent(inputEvent);
        dispatchEvents(activeElement);
    } 
    else if (activeElement.isContentEditable) {
        try {
            document.execCommand('insertText', false, text);
        } catch (e) {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(activeElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
        }
        
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: text
        });
        
        activeElement.dispatchEvent(inputEvent);
        dispatchEvents(activeElement);
    } else {
        navigator.clipboard.writeText(text);
    }
}
