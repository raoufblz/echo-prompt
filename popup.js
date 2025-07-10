//i hope i could make this lmao


let prompts = [];
let editingPromptId = null;

let currentSearchTerm = '';
let isSearchActive = false;


function loadPrompts() {
    const savedPrompts = localStorage.getItem('quickPrompts');
    return savedPrompts ? JSON.parse(savedPrompts) : [];
}

function openPromptDialog(promptId = null) {
    const dialog = document.getElementById('promptDialog');
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');

    if (promptId) {
        const promptToEdit = prompts.find(prompt => prompt.id === promptId);
        editingPromptId = promptId;
        document.getElementById('dialogTitle').textContent = 'Edit Prompt';
        titleInput.value = promptToEdit.title;
        contentInput.value = promptToEdit.content;
    } else {
        editingPromptId = null;
        document.getElementById('dialogTitle').textContent = 'Add New Prompt';
        titleInput.value = '';
        contentInput.value = '';
    }

    dialog.showModal();
    titleInput.focus();
}

function savePrompt(event) {
    event.preventDefault();

    const title = document.getElementById('promptTitle').value.trim();
    const content = document.getElementById('promptContent').value.trim();

    if (!title || !content) return;

    if (editingPromptId) {
        const promptIndex = prompts.findIndex(prompt => prompt.id === editingPromptId);
        prompts[promptIndex] = {
            ...prompts[promptIndex],
            title,
            content
        };
    } else {
        prompts.unshift({
            id: generateId(),
            title,
            content
        });
    }

    savePrompts();
    renderPrompts();
    closePromptDialog();
    document.getElementById('promptForm').reset();
}

function generateId() {
    return Date.now().toString();
}

function savePrompts() {
    localStorage.setItem('quickPrompts', JSON.stringify(prompts));
    document.querySelector('.search-input').value = '';
    handleSearch();
}

function deletePrompt(promptId) {
    prompts = prompts.filter(prompt => prompt.id !== promptId);
    savePrompts();
    renderPrompts();
    document.querySelector('.search-input').value = '';
    handleSearch();
}


function filterPrompts(searchTerm) {
    if (!searchTerm.trim()) {
        return [...prompts];
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    return prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(lowerCaseSearch) || 
        prompt.content.toLowerCase().includes(lowerCaseSearch)
    );
}


function renderPrompts(promptsArray = prompts) {
    const promptsContainer = document.getElementById('promptsContainer');

    if (promptsArray.length === 0) {
        const noResultsMessage = isSearchActive 
            ? `<p>No prompts found for "${currentSearchTerm}"</p>` 
            : '<p>create your first prompt!</p>';
        
        promptsContainer.innerHTML = `
            <div class="empty-state">
                <h2>${isSearchActive ? 'No Results' : 'No Prompts yet'}</h2>
                ${noResultsMessage}
                <button id="emptyStateAddBtn" class="add-prompt-btn">+ add prompt</button>
            </div>
        `;
        return;
    }

    promptsContainer.innerHTML = promptsArray.map(prompt => `
        <div class='prompt-card' data-prompt-id="${prompt.id}">
            <h3 class='prompt-title'>${prompt.title}</h3>
            <p class='prompt-content'>${prompt.content}</p>
            <div class="prompt-actions">
                <button class="edit-btn" title="edit prompt">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="delete-btn" title="delete prompt">
                    <span class="material-symbols-outlined">delete</span>
                </button>
                <button class="insert-btn" data-prompt="{{ prompt.text }}" title="insert prompt">
                    <span class="material-symbols-outlined">chat_paste_go</span>
                </button>
            </div>
        </div>    
    `).join('');
}


function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    currentSearchTerm = searchInput.value;
    isSearchActive = currentSearchTerm.trim() !== '';
    
    const filteredPrompts = filterPrompts(currentSearchTerm);
    renderPrompts(filteredPrompts);
}


function closePromptDialog() {
    document.getElementById('promptDialog').close();
}

function handleContainerClick(event) {
    const promptCard = event.target.closest('.prompt-card');
    if (!promptCard) return;

    const promptId = promptCard.dataset.promptId;
    
    if (event.target.closest('.edit-btn')) {
        openPromptDialog(promptId);
    } else if (event.target.closest('.delete-btn')) {
        deletePrompt(promptId);
    }  else if (event.target.closest('.insert-btn')) {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
            insertPrompt(prompt.content);
        }
    }
}


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification("Prompt copied to clipboard!");
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function insertPrompt(promptContent) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0]) {
            copyToClipboard(promptContent);
            return;
        }
        
        chrome.tabs.sendMessage(tabs[0].id, { 
            action: "insertPrompt", 
            content: promptContent
        }, (response) => {
            if (chrome.runtime.lastError || !response?.success) {
                copyToClipboard(promptContent);
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    prompts = loadPrompts();
    renderPrompts();

    document.getElementById('addPromptBtn').addEventListener('click', () => openPromptDialog());
    document.getElementById('closeDialogBtn').addEventListener('click', closePromptDialog);
    document.getElementById('cancelDialogBtn').addEventListener('click', closePromptDialog);
    document.getElementById('promptForm').addEventListener('submit', savePrompt);
    
    document.getElementById('promptsContainer').addEventListener('click', handleContainerClick);
    
    document.body.addEventListener('click', (event) => {
        if (event.target.id === 'emptyStateAddBtn') {
            openPromptDialog();
        }
    });

    document.getElementById('promptDialog').addEventListener('click', function(event) {
        if (event.target === this) {
            closePromptDialog();
        }
    });
    
     const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', handleSearch);
    
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.addEventListener('click', function() {
        if (searchInput.value) {
            searchInput.value = '';
            handleSearch();
        }
    });
});
