// ============================================
// DOCUMENTS PAGE FUNCTIONALITY
// ============================================

let currentQuery = '';

document.addEventListener('DOMContentLoaded', function () {
    initializeDocumentsPage();
});

function initializeDocumentsPage() {
    addDocumentStyles();
    setupSearch();
    renderDocuments(TrustVaultStorage.getDocuments());
}

function setupSearch() {
    const searchInput = document.querySelector('.search-wrapper input');

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener('input', function (event) {
        currentQuery = event.target.value.trim().toLowerCase();
        const filteredDocuments = filterDocuments(TrustVaultStorage.getDocuments(), currentQuery);
        renderDocuments(filteredDocuments);
    });
}

function filterDocuments(documents, query) {
    if (!query) {
        return documents;
    }

    return documents.filter(function (documentItem) {
        const haystack = [
            documentItem.name || documentItem.documentName || documentItem.fileName || '',
            documentItem.fileName || '',
            documentItem.category || '',
            documentItem.description || '',
            documentItem.uploadDate || documentItem.uploadedAt || ''
        ].join(' ').toLowerCase();

        return haystack.includes(query);
    });
}

function renderDocuments(documents) {
    const grid = document.getElementById('documentsGrid');

    if (!grid) {
        return;
    }

    grid.innerHTML = '';

    if (!Array.isArray(documents) || !documents.length) {
        grid.innerHTML = '<div class="empty-state">No documents found. Upload one to get started.</div>';
        return;
    }

    documents.forEach(function (documentItem) {
        grid.appendChild(createDocumentCard(documentItem));
    });
}

function createDocumentCard(documentItem) {
    const categoryInfo = getCategoryInfo(documentItem.category);
    const card = document.createElement('article');
    card.className = 'document-card';

    card.innerHTML = [
        '<div class="card-header">',
        '  <div class="file-icon ' + categoryInfo.iconClass + '">',
        '    <i class="' + categoryInfo.icon + '"></i>',
        '  </div>',
        '</div>',
        '<div class="card-body">',
        '  <h3>' + escapeHtml(documentItem.name || documentItem.documentName || documentItem.fileName) + '</h3>',
        '  <p class="file-size">' + escapeHtml(documentItem.fileName || documentItem.name) + ' • ' + formatFileSize(documentItem.size) + '</p>',
        '  <div class="card-tags">',
        '    <span class="tag ' + categoryInfo.tagClass + '">' + categoryInfo.label + '</span>',
        '  </div>',
        documentItem.description ? '  <p class="card-description">' + escapeHtml(documentItem.description) + '</p>' : '',
        '  <p class="card-meta">Upload Date: ' + escapeHtml(documentItem.uploadDate || documentItem.uploadedAt || '') + '</p>',
        '</div>',
        '<div class="card-footer">',
        '  <button class="btn-action edit-btn" type="button" data-action="edit" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-pen"></i> Edit',
        '  </button>',
        '  <button class="btn-action delete-btn" type="button" data-action="delete" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-trash"></i> Delete',
        '  </button>',
        '</div>'
    ].join('');

    const editButton = card.querySelector('.edit-btn');
    const deleteButton = card.querySelector('.delete-btn');

    if (editButton) {
        editButton.addEventListener('click', function () {
            showEditModal(documentItem);
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', function () {
            if (confirm('Delete this document?')) {
                TrustVaultStorage.deleteDocument(documentItem.id);
                renderDocuments(filterDocuments(TrustVaultStorage.getDocuments(), currentQuery));
            }
        });
    }

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

function showEditModal(documentItem) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = [
        '<div class="modal-card">',
        '  <h3>Edit Document</h3>',
        '  <form id="editDocumentForm">',
        '    <label class="modal-label">Name</label>',
        '    <input type="text" id="editDocumentName" class="form-input" value="' + escapeHtml(documentItem.name || documentItem.documentName || documentItem.fileName) + '">',
        '    <label class="modal-label">Category</label>',
        '    <select id="editDocumentCategory" class="form-select">',
        '      <option value="identity" ' + (documentItem.category === 'identity' ? 'selected' : '') + '>Identity</option>',
        '      <option value="financial" ' + (documentItem.category === 'financial' ? 'selected' : '') + '>Financial</option>',
        '      <option value="legal" ' + (documentItem.category === 'legal' ? 'selected' : '') + '>Legal</option>',
        '      <option value="ownership" ' + (documentItem.category === 'ownership' ? 'selected' : '') + '>Ownership</option>',
        '      <option value="medical" ' + (documentItem.category === 'medical' ? 'selected' : '') + '>Medical</option>',
        '      <option value="education" ' + (documentItem.category === 'education' ? 'selected' : '') + '>Education</option>',
        '      <option value="other" ' + (documentItem.category === 'other' ? 'selected' : '') + '>Other</option>',
        '    </select>',
        '    <label class="modal-label">Description</label>',
        '    <textarea id="editDocumentDescription" class="form-textarea" rows="4">' + escapeHtml(documentItem.description || '') + '</textarea>',
        '    <div class="modal-actions">',
        '      <button type="button" class="btn-cancel" data-close="true">Cancel</button>',
        '      <button type="submit" class="btn-submit">Save</button>',
        '    </div>',
        '  </form>',
        '</div>'
    ].join('');

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('[data-close="true"]').addEventListener('click', function () {
        modalOverlay.remove();
    });

    modalOverlay.addEventListener('click', function (event) {
        if (event.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    modalOverlay.querySelector('#editDocumentForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const updatedName = document.getElementById('editDocumentName').value.trim();
        const updatedCategory = document.getElementById('editDocumentCategory').value;
        const updatedDescription = document.getElementById('editDocumentDescription').value.trim();

        if (!updatedName) {
            alert('Please enter a document name.');
            return;
        }

        TrustVaultStorage.updateDocument(documentItem.id, {
            name: updatedName,
            category: updatedCategory,
            description: updatedDescription
        });

        modalOverlay.remove();
        renderDocuments(filterDocuments(TrustVaultStorage.getDocuments(), currentQuery));
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
        .document-card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .card-header {
            padding: 20px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #edf2f7;
        }

        .card-body {
            padding: 20px;
            flex: 1;
        }

        .card-footer {
            display: flex;
            gap: 10px;
            padding: 16px 20px;
            background-color: #f8f9fa;
            border-top: 1px solid #edf2f7;
        }

        .edit-btn, .delete-btn {
            flex: 1;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            color: #4a5568;
            padding: 10px 12px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
        }

        .delete-btn:hover {
            color: #dc2626;
            border-color: #dc2626;
        }

        .edit-btn:hover {
            color: #667eea;
            border-color: #667eea;
        }

        .card-description {
            margin-top: 10px;
            color: #4a5568;
            font-size: 14px;
            line-height: 1.5;
        }

        .card-meta {
            margin-top: 10px;
            color: #718096;
            font-size: 13px;
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

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
        }

        .modal-card {
            width: 100%;
            max-width: 480px;
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        .modal-card h3 {
            margin-bottom: 16px;
            color: #2d3748;
        }

        .modal-label {
            display: block;
            margin-bottom: 6px;
            color: #2d3748;
            font-size: 14px;
            font-weight: 600;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #cbd5e0;
            border-radius: 8px;
            margin-bottom: 14px;
            font-size: 14px;
        }

        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 8px;
        }

        .btn-cancel, .btn-submit {
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }

        .btn-cancel {
            background-color: #e2e8f0;
            color: #2d3748;
        }

        .btn-submit {
            background-color: #667eea;
            color: #ffffff;
        }

        .passport-icon {
            background-color: #e3f2fd;
            color: #1e88e5;
        }

        .bank-icon {
            background-color: #e8f5e9;
            color: #388e3c;
        }

        .contract-icon {
            background-color: #fce4ec;
            color: #c2185b;
        }

        .vehicle-icon {
            background-color: #fff3e0;
            color: #e65100;
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

        .tag.identity {
            background-color: #e3f2fd;
            color: #1e88e5;
        }

        .tag.financial {
            background-color: #e8f5e9;
            color: #388e3c;
        }

        .tag.legal {
            background-color: #fce4ec;
            color: #c2185b;
        }

        .tag.ownership {
            background-color: #fff3e0;
            color: #e65100;
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
