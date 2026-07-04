// ============================================
// DOCUMENTS PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeDocumentsPage();
});

function initializeDocumentsPage() {
    setupSearch();
    renderDocuments(TrustVaultStorage.getDocuments());
    setupCardActions();
    addDocumentStyles();
}

function setupSearch() {
    const searchInput = document.querySelector('.search-wrapper input');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', function (event) {
        const query = event.target.value.trim().toLowerCase();
        const documents = TrustVaultStorage.getDocuments();
        const filteredDocuments = filterDocuments(documents, query);
        renderDocuments(filteredDocuments);
    });
}

function filterDocuments(documents, query) {
    if (!query) {
        return documents;
    }

    return documents.filter(function (documentItem) {
        const haystack = [
            documentItem.documentName,
            documentItem.fileName,
            documentItem.description,
            documentItem.category,
            documentItem.uploadTime
        ].join(' ').toLowerCase();

        return haystack.includes(query);
    });
}

function renderDocuments(documents) {
    const grid = document.querySelector('.documents-grid');

    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    if (!documents.length) {
        grid.innerHTML = '<div class="empty-state">No documents matched your search.</div>';
        return;
    }

    documents.forEach(function (documentItem) {
        grid.appendChild(createDocumentCard(documentItem));
    });
}

function createDocumentCard(documentItem) {
    const categoryInfo = getCategoryInfo(documentItem.category);
    const card = document.createElement('div');
    card.className = 'document-card';

    card.innerHTML = [
        '<div class="card-header">',
        '  <div class="file-icon ' + categoryInfo.iconClass + '">',
        '    <i class="' + categoryInfo.icon + '"></i>',
        '  </div>',
        '  <div class="card-actions">',
        '    <button class="action-btn" type="button" data-action="menu" data-id="' + documentItem.id + '" data-name="' + escapeHtml(documentItem.documentName || documentItem.fileName) + '" title="More options">',
        '      <i class="fa-solid fa-ellipsis-vertical"></i>',
        '    </button>',
        '  </div>',
        '</div>',
        '<div class="card-body">',
        '  <h3>' + escapeHtml(documentItem.documentName || documentItem.fileName) + '</h3>',
        '  <p class="file-size">' + escapeHtml(documentItem.fileName) + ' • ' + formatFileSize(documentItem.fileSize) + '</p>',
        '  <div class="card-tags">',
        '    <span class="tag ' + categoryInfo.tagClass + '">' + categoryInfo.label + '</span>',
        '  </div>',
        documentItem.description ? '  <p class="card-description">' + escapeHtml(documentItem.description) + '</p>' : '',
        '  <p class="card-meta">' + escapeHtml(documentItem.uploadTime || '') + '</p>',
        '</div>',
        '<div class="card-footer">',
        '  <button class="btn-action view-btn" type="button" data-action="view" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-eye"></i> View',
        '  </button>',
        '  <button class="btn-action download-btn" type="button" data-action="download" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-download"></i> Download',
        '  </button>',
        '</div>'
    ].join('');

    return card;
}

function getCategoryInfo(category) {
    const categoryMap = {
        identity: { label: 'Identity', iconClass: 'passport-icon', tagClass: 'identity', icon: 'fa-solid fa-passport' },
        financial: { label: 'Financial', iconClass: 'bank-icon', tagClass: 'financial', icon: 'fa-solid fa-building-columns' },
        legal: { label: 'Legal', iconClass: 'contract-icon', tagClass: 'legal', icon: 'fa-solid fa-file-contract' },
        ownership: { label: 'Ownership', iconClass: 'vehicle-icon', tagClass: 'ownership', icon: 'fa-solid fa-car' },
        medical: { label: 'Medical', iconClass: 'medical-icon', tagClass: 'medical', icon: 'fa-solid fa-stethoscope' },
        education: { label: 'Education', iconClass: 'education-icon', tagClass: 'education', icon: 'fa-solid fa-graduation-cap' },
        other: { label: 'Other', iconClass: 'general-icon', tagClass: 'other', icon: 'fa-solid fa-file-alt' }
    };

    return categoryMap[category] || categoryMap.other;
}

function formatFileSize(bytes) {
    if (!bytes) {
        return '0 Bytes';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / Math.pow(1024, index);
    return size.toFixed(index === 0 ? 0 : 1) + ' ' + units[index];
}

function setupCardActions() {
    const grid = document.querySelector('.documents-grid');

    if (!grid) {
        return;
    }

    grid.addEventListener('click', function (event) {
        const button = event.target.closest('button[data-action]');

        if (!button) {
            return;
        }

        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');

        if (action === 'view') {
            viewDocument(id);
        } else if (action === 'download') {
            downloadDocument(button, id);
        } else if (action === 'menu') {
            showContextMenu(button, id, button.getAttribute('data-name'));
        }
    });
}

function viewDocument(id) {
    const documentItem = TrustVaultStorage.getDocumentById(id);

    if (!documentItem) {
        return;
    }

    alert('Opening "' + documentItem.documentName + '" for viewing...\n\nViewer feature coming soon!');
}

function downloadDocument(button, id) {
    const documentItem = TrustVaultStorage.getDocumentById(id);

    if (!button || !documentItem) {
        return;
    }

    const originalHtml = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    window.setTimeout(function () {
        button.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #388e3c;"></i> Done!';
        window.setTimeout(function () {
            button.innerHTML = originalHtml;
            button.disabled = false;
        }, 1800);
    }, 1000);
}

function showContextMenu(button, id, fileName) {
    const existingMenus = document.querySelectorAll('.context-menu');
    existingMenus.forEach(function (menu) {
        menu.remove();
    });

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = [
        '<button class="menu-item delete-item" type="button">',
        '  <i class="fa-solid fa-trash"></i> Delete',
        '</button>',
        '<button class="menu-item share-item" type="button">',
        '  <i class="fa-solid fa-share"></i> Share',
        '</button>',
        '<button class="menu-item rename-item" type="button">',
        '  <i class="fa-solid fa-pen"></i> Rename',
        '</button>'
    ].join('');

    document.body.appendChild(menu);

    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';

    menu.querySelector('.delete-item').addEventListener('click', function () {
        if (confirm('Are you sure you want to delete "' + fileName + '"?')) {
            TrustVaultStorage.deleteDocument(id);
            renderDocuments(TrustVaultStorage.getDocuments());
        }
        menu.remove();
    });

    menu.querySelector('.share-item').addEventListener('click', function () {
        alert('Sharing "' + fileName + '" - Feature coming soon!');
        menu.remove();
    });

    menu.querySelector('.rename-item').addEventListener('click', function () {
        const newName = prompt('Rename "' + fileName + '" to:', fileName);

        if (newName && newName.trim() && newName.trim() !== fileName) {
            TrustVaultStorage.updateDocument(id, { documentName: newName.trim() });
            renderDocuments(TrustVaultStorage.getDocuments());
        }

        menu.remove();
    });

    document.addEventListener('click', function closeMenu(event) {
        if (!menu.contains(event.target) && event.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addDocumentStyles() {
    if (document.getElementById('documents-page-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'documents-page-styles';
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
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

        .card-description {
            color: #4a5568;
            font-size: 13px;
            margin-top: 10px;
            line-height: 1.4;
        }

        .card-meta {
            color: #a0aec0;
            font-size: 12px;
            margin-top: 8px;
        }

        .empty-state {
            grid-column: 1 / -1;
            padding: 36px 24px;
            text-align: center;
            color: #718096;
            background-color: #f8fafc;
            border: 1px dashed #cbd5e0;
            border-radius: 12px;
        }

        .medical-icon {
            background-color: #e0f2fe;
            color: #0369a1;
        }

        .education-icon {
            background-color: #ede9fe;
            color: #6d28d9;
        }

        .general-icon {
            background-color: #f3f4f6;
            color: #4b5563;
        }

        .tag.medical {
            background-color: #e0f2fe;
            color: #0369a1;
        }

        .tag.education {
            background-color: #ede9fe;
            color: #6d28d9;
        }

        .tag.other {
            background-color: #f3f4f6;
            color: #4b5563;
        }
    `;
    document.head.appendChild(style);
}
