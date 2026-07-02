// ============================================
// DOCUMENTS PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDocumentsPage();
});

/**
 * Initialize the documents page
 */
function initializeDocumentsPage() {
    setupActionButtons();
    setupViewButtons();
    setupDownloadButtons();
}

/**
 * Setup action buttons (menu buttons)
 */
function setupActionButtons() {
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.document-card');
            const fileName = card.querySelector('.card-body h3').textContent;
            showContextMenu(this, fileName);
        });
    });
}

/**
 * Show context menu for document actions
 */
function showContextMenu(button, fileName) {
    // Remove existing menus
    const existingMenus = document.querySelectorAll('.context-menu');
    existingMenus.forEach(menu => menu.remove());

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
        <button class="menu-item delete-item">
            <i class="fa-solid fa-trash"></i> Delete
        </button>
        <button class="menu-item share-item">
            <i class="fa-solid fa-share"></i> Share
        </button>
        <button class="menu-item rename-item">
            <i class="fa-solid fa-pen"></i> Rename
        </button>
    `;
    
    document.body.appendChild(menu);

    // Position menu
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';

    // Setup menu item listeners
    menu.querySelector('.delete-item').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            const card = button.closest('.document-card');
            card.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => card.remove(), 300);
        }
        menu.remove();
    });

    menu.querySelector('.share-item').addEventListener('click', () => {
        alert(`Sharing "${fileName}" - Feature coming soon!`);
        menu.remove();
    });

    menu.querySelector('.rename-item').addEventListener('click', () => {
        const newName = prompt(`Rename "${fileName}" to:`, fileName);
        if (newName && newName !== fileName) {
            const card = button.closest('.document-card');
            card.querySelector('.card-body h3').textContent = newName;
        }
        menu.remove();
    });

    // Close menu on outside click
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

/**
 * Setup view buttons
 */
function setupViewButtons() {
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileName = card.querySelector('.card-body h3').textContent;
            viewDocument(fileName);
        });
    });
}

/**
 * View document
 */
function viewDocument(fileName) {
    alert(`Opening "${fileName}" for viewing...\n\nViewer feature coming soon!`);
    console.log(`View requested for: ${fileName}`);
}

/**
 * Setup download buttons
 */
function setupDownloadButtons() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileName = card.querySelector('.card-body h3').textContent;
            const fileSize = card.querySelector('.file-size').textContent;
            downloadDocument(fileName, fileSize);
        });
    });
}

/**
 * Download document (simulated)
 */
function downloadDocument(fileName, fileSize) {
    const btn = event.target.closest('.download-btn');
    const originalText = btn.innerHTML;
    
    // Show downloading state
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
    btn.disabled = true;
    
    // Simulate download (in real app, would trigger actual file download)
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #388e3c;"></i> Done!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1500);
    
    console.log(`Downloading: ${fileName} (${fileSize})`);
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.querySelector('.search-wrapper input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.document-card');
            
            cards.forEach(card => {
                const fileName = card.querySelector('.card-body h3').textContent.toLowerCase();
                const category = card.querySelector('.tag').textContent.toLowerCase();
                
                const matches = fileName.includes(query) || category.includes(query);
                card.style.display = matches ? 'flex' : 'none';
            });
        });
    }
}

// Initialize search
setupSearch();

// Add fade-out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }

    .context-menu {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        min-width: 160px;
    }

    .context-menu .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        color: #2d3748;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }

    .context-menu .menu-item:first-child {
        border-radius: 8px 8px 0 0;
    }

    .context-menu .menu-item:last-child {
        border-radius: 0 0 8px 8px;
    }

    .context-menu .menu-item:hover {
        background-color: #f0f4f8;
        color: #667eea;
    }

    .context-menu .delete-item:hover {
        color: #dc2626;
    }
`;
document.head.appendChild(style);
