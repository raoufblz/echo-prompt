//i hope i could make this lmao


let prompts = [];
let editingPromptId = null;


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
}

function deletePrompt(promptId) {
    prompts = prompts.filter(prompt => prompt.id !== promptId);
    savePrompts();
    renderPrompts();
}

function renderPrompts() {
    const promptsContainer = document.getElementById('promptsContainer');

    if (prompts.length === 0) {
        promptsContainer.innerHTML = `
            <div class="empty-state">
                <h2>No Prompts yet</h2>
                <p>create your first prompt!</p>
                <button id="emptyStateAddBtn" class="add-prompt-btn">+ add prompt</button>
            </div>
        `;
        return;
    }

    promptsContainer.innerHTML = prompts.map(prompt => `
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
                <button class="insert-btn" data-prompt="{{ prompt.text }}">
                    <span class="material-symbols-outlined">chat_paste_go</span>
                </button>
            </div>
        </div>    
    `).join('');
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
    }
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
});
