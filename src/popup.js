//i hope i could make this lmao, i guess i did
// Runs only in the popup.html not the web pages

let prompts = [];                // in-memory array of prompt objects
let editingPromptId = null;     // non-null => we re editing a prompt
                               // else => we re adding a prompt
let currentSearchTerm = '';   // live search
let isSearchActive = false;  // true if there is some text
let activeTag = null;       // for tag filter

function loadPrompts() {
    const savedPrompts = localStorage.getItem('quickPrompts');
    return savedPrompts ? JSON.parse(savedPrompts) : [];
}

// Alphabetically sorted of every unique tag
function collectAllTags() {
    const set = new Set();
    prompts.forEach(p => (p.tags || []).forEach(t => set.add(t.trim())));
    return [...set].sort((a, b) => a.localeCompare(b));
}

// PromptId = null means "adding prompt" else means "editing prompt"
function openPromptDialog(promptId = null) {
    const dialog = document.getElementById('promptDialog');
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');
    const tagsInput   = document.getElementById('promptTags');

    if (promptId) { // Entering edit mode
        const promptToEdit = prompts.find(p => p.id === promptId);
        editingPromptId = promptId;
        document.getElementById('dialogTitle').textContent = 'Edit Prompt';
        titleInput.value   = promptToEdit.title;
        contentInput.value = promptToEdit.content;
        tagsInput.value    = (promptToEdit.tags || []).join(', ');
    } else { // Add mode so everything is blank
        editingPromptId = null;
        document.getElementById('dialogTitle').textContent = 'Add New Prompt';
        titleInput.value   = '';
        contentInput.value = '';
        tagsInput.value    = '';
    }

    dialog.showModal();
    titleInput.focus();
}

function savePrompt(event) {
    event.preventDefault(); // With default being re-loading the popup

    const title   = document.getElementById('promptTitle').value.trim();
    const content = document.getElementById('promptContent').value.trim();
    const tagsRaw = document.getElementById('promptTags').value.trim();
    if (!title || !content) return; // Stops the function immediately if either the title or content field is blank

    const tags = tagsRaw          // Split,trim,lowercase,remove emptinesse,a set to delete duplicates
        ? [ ... new Set(tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))]
        : [];

    if (editingPromptId) {
        // We re gonna replace the prompt
        const idx = prompts.findIndex(p => p.id === editingPromptId);
        prompts[idx] = { ...prompts[idx], title, content, tags };
    } else {
        // Add prompt to the top
        prompts.unshift({ id: generateId(), title, content, tags });
    }

    savePrompts();
    renderPrompts();
    closePromptDialog();
    document.getElementById('promptForm').reset();
}

// Using time to generate an ID
function generateId() {
    return Date.now().toString();
}

function savePrompts() {
    localStorage.setItem('quickPrompts', JSON.stringify(prompts));
    document.querySelector('.search-input').value = '';         // UX choice
    handleSearch(); 
}

function deletePrompt(promptId) {
    prompts = prompts.filter(p => p.id !== promptId);
    savePrompts();
    renderPrompts();
    document.querySelector('.search-input').value = ''; // UX choice
    handleSearch();
}

// filter by search term and tag
function filterPrompts(searchTerm, tagFilter) {
    let result = prompts;

    if (searchTerm.trim()) {
        const low = searchTerm.toLowerCase();
        result = result.filter(
            p =>
                p.title.toLowerCase().includes(low) ||
                p.content.toLowerCase().includes(low)
        );
    }

    if (tagFilter) {
        result = result.filter(p => (p.tags || []).includes(tagFilter));
    }

    return result;
}

// renders the list of prompts (or the empty state message)
function renderPrompts(promptsArray = null) {
    const container = document.getElementById('promptsContainer');

    renderTagBar(); // or refresh it

    // if null re-compute from current search + tag
    if (promptsArray === null) {
        const searchTerm = document.querySelector('.search-input').value;
        promptsArray = filterPrompts(searchTerm, activeTag);
    }

    // empty state message (search or void state)
    if (promptsArray.length === 0) {
        const noResultsMessage = isSearchActive || activeTag
            ? `<p>No prompts found.</p>`
            : '<p>create your first prompt!</p>';
        container.innerHTML = `
            <div class="empty-state">
                <h2>${activeTag || isSearchActive ? 'No Results' : 'No Prompts yet'}</h2>
                ${noResultsMessage}
                <button id="emptyStateAddBtn" class="add-prompt-btn">add prompt</button>
            </div>`;
        return;
    }

    // hmtl for every prompt card
    container.innerHTML = promptsArray
        .map(
            p => `
        <div class='prompt-card' data-prompt-id="${p.id}">
            <div style="display:flex; align-items:center;">
                <h3 class='prompt-title' style="flex:1;">${p.title}</h3>
                <span class="drag-handle material-symbols-outlined" title="Drag to re-order">drag_indicator</span>
            </div>
            <p class='prompt-content'>${p.content}</p>
            <div class="tags-n-buttons">
            <div>
            ${
                (p.tags || []).length
                    ? `<div class="prompt-tags">${(p.tags || [])
                          .map(t => `<span class="tag-pill">${t}</span>`)
                          .join('')}</div>`
                    : ''
            }
            </div>  
            <div class="prompt-actions">
                <button class="edit-btn" title="edit prompt">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-btn" title="delete prompt">
                    <span class="material-symbols-outlined">delete</span>
                </button>
                <button class="insert-btn" title="insert prompt">
                    <span class="material-symbols-outlined">chat_paste_go</span>
                </button>
            </div>
            </div>
        </div>
    `
        )
        .join('');           // turn array of strings into one string
    attachDragHandlers();   // re-wire drag and drop listners after re-render
}

// create/ update (if edit) the tag bar inside prompt cards
function renderTagBar() {
    const bar = document.querySelector('.tag-container');
    const allTags = collectAllTags();

    bar.innerHTML = ''; // clears previous

    // add "all" pill/tag
    const allPill = document.createElement('span');
    allPill.className = 'tag-pill' + (activeTag === null ? ' active' : '');
    allPill.textContent = 'All';
    allPill.addEventListener('click', () => {
        activeTag = null;
        handleSearch();
    });
    bar.appendChild(allPill);

    // add on pill per unique tag
    allTags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill' + (tag === activeTag ? ' active' : '');
        pill.textContent = tag;
        pill.addEventListener('click', () => {
            activeTag = tag;
            handleSearch();
        });
        bar.appendChild(pill);
    });
}

// react to changes in search input box or tag filter
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    currentSearchTerm = searchInput.value;
    isSearchActive = currentSearchTerm.trim() !== '';

    const filtered = filterPrompts(currentSearchTerm, activeTag);
    renderPrompts(filtered);
}

// obvsly close dialog modal (add, edit)
function closePromptDialog() {
    document.getElementById('promptDialog').close();
}

// click handlers for edit/delete/insert buttons
function handleContainerClick(event) {
    const promptCard = event.target.closest('.prompt-card');
    if (!promptCard) return;

    const promptId = promptCard.dataset.promptId;

    if (event.target.closest('.edit-btn')) {
        openPromptDialog(promptId);
    } else if (event.target.closest('.delete-btn')) {
        deletePrompt(promptId);
    } else if (event.target.closest('.insert-btn')) {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) insertPrompt(prompt.content);
    }
}

// copy text to clipboard and show a notif
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Prompt copied to clipboard!');
    });
}

// gree notif at bottom right
function showNotification(message) {
    const n = document.createElement('div');
    n.textContent = message;
    Object.assign(n.style, {
        position: 'fixed', bottom: '20px', right: '20px',
        background: '#4CAF50', color: 'white', padding: '10px',
        borderRadius: '5px', zIndex: '10000'
    });
    document.body.appendChild(n);
    setTimeout(() => document.body.removeChild(n), 3500);
}

// ask the active tab to insert the prompt via content.js
function insertPrompt(promptContent) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]) {
            copyToClipboard(promptContent);
            return;
        }
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'insertPrompt', content: promptContent },
            response => {
                if (chrome.runtime.lastError || !response?.success) {
                    copyToClipboard(promptContent);
                }
            }
        );
    });
}

// drag & drop
let draggedEl = null;                // ref to the card being dragged
function attachDragHandlers() {     // make every drag handle draggable
    document.querySelectorAll('.drag-handle').forEach(handle => {
        const card = handle.closest('.prompt-card');
        handle.setAttribute('draggable', true);
        handle.addEventListener('dragstart', e => {
            draggedEl = card;
            card.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });
        handle.addEventListener('dragend', () => {
            card.style.opacity = '1';
            draggedEl = null;
        });
    });

    // listen on every prompt card for drop targets
    document.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('dragover', e => {
            if (!draggedEl) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (card !== draggedEl) card.classList.add('drag-over');
        });
        card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
        card.addEventListener('drop', e => {
            if (!draggedEl || card === draggedEl) return;
            e.preventDefault();
            card.classList.remove('drag-over');

            const container = document.getElementById('promptsContainer');
            const allCards = [...container.querySelectorAll('.prompt-card')];
            const draggedIdx = allCards.indexOf(draggedEl);
            const targetIdx = allCards.indexOf(card);

            // re-order the array
            const [removed] = prompts.splice(draggedIdx, 1);
            prompts.splice(targetIdx, 0, removed);

            savePrompts();
            renderPrompts(filterPrompts(document.querySelector('.search-input').value, activeTag));
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    prompts = loadPrompts();    // load from localStorage
    renderPrompts();

    // button listeners
    document.getElementById('addPromptBtn').addEventListener('click', () => openPromptDialog());
    document.getElementById('closeDialogBtn').addEventListener('click', closePromptDialog);
    document.getElementById('cancelDialogBtn').addEventListener('click', closePromptDialog);
    document.getElementById('promptForm').addEventListener('submit', savePrompt);

    // ctrl + k to openPromptDialog
    document.addEventListener('keydown', (e) => { 
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPromptDialog();
    }
    });

    // delegated click handler for prompt cards
    document.getElementById('promptsContainer').addEventListener('click', handleContainerClick);
    document.body.addEventListener('click', e => {
        if (e.target.id === 'emptyStateAddBtn') openPromptDialog();
    });

    // close dialog if user clicks backdrop
    document.getElementById('promptDialog').addEventListener('click', e => {
        if (e.target === e.currentTarget) closePromptDialog();
    });

    // search box live filtering
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', handleSearch);
    document.querySelector('.search-btn').addEventListener('click', () => {
        if (searchInput.value) {
            searchInput.value = '';
            handleSearch();
        }
    });
});
