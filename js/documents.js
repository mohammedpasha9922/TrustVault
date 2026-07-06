document.addEventListener('DOMContentLoaded', function () {
    initializeDocumentsPage();
});

let currentQuery = '';
let selectedCategory = 'all';
let sortOrder = 'newest';
let showOnlyFavorites = false;

function initializeDocumentsPage() {
    addDocumentStyles();
    bindDocumentControls();
    renderDocuments();
}

function bindDocumentControls() {
    const searchInput = document.getElementById('documentsSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const favoritesToggle = document.getElementById('favoritesToggle');

    if (searchInput) {
        searchInput.addEventListener('input', function (event) {
            currentQuery = event.target.value.trim().toLowerCase();
            renderDocuments();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function (event) {
            selectedCategory = event.target.value;
            renderDocuments();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function (event) {
            sortOrder = event.target.value;
            renderDocuments();
        });
    }

    if (favoritesToggle) {
        favoritesToggle.addEventListener('click', function () {
            showOnlyFavorites = !showOnlyFavorites;
            favoritesToggle.classList.toggle('active', showOnlyFavorites);
            favoritesToggle.textContent = showOnlyFavorites ? 'Favorites Only: On' : 'Favorites Only';
            renderDocuments();
        });
    }
}

function getFilteredDocuments() {
    const documents = TrustVaultStorage.getDocuments();

    return documents.filter(function (documentItem) {
        const matchesQuery = !currentQuery || [
            documentItem.name || '',
            documentItem.fileName || '',
            documentItem.keywords || '',
            documentItem.description || ''
        ].join(' ').toLowerCase().includes(currentQuery);

        const matchesCategory = selectedCategory === 'all' || (documentItem.category || 'other') === selectedCategory;
        const matchesFavorite = !showOnlyFavorites || Boolean(documentItem.isFavorite);

        return matchesQuery && matchesCategory && matchesFavorite;
    }).sort(function (left, right) {
        if (sortOrder === 'name') {
            return String(left.name || '').localeCompare(String(right.name || ''));
        }

        const leftDate = new Date(left.uploadDate || 0).getTime();
        const rightDate = new Date(right.uploadDate || 0).getTime();
        return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
    });
}

function renderDocuments() {
    const grid = document.getElementById('documentsGrid');

    if (!grid) {
        return;
    }

    const documents = getFilteredDocuments();
    grid.innerHTML = '';

    if (!documents.length) {
        grid.innerHTML = '<div class="empty-state">No documents match the current filters. Upload one to get started.</div>';
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
        '  <button class="favorite-btn ' + (documentItem.isFavorite ? 'active' : '') + '" type="button" data-action="favorite" data-id="' + documentItem.id + '">',
        '    <i class="' + (documentItem.isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star') + '"></i>',
        '  </button>',
        '</div>',
        '<div class="card-body">',
        '  <h3>' + escapeHtml(documentItem.name || documentItem.fileName) + '</h3>',
        '  <p class="file-size">' + escapeHtml(documentItem.fileName || documentItem.name) + ' • ' + escapeHtml(documentItem.fileSize || '0 Bytes') + '</p>',
        '  <div class="card-tags">',
        '    <span class="tag ' + categoryInfo.tagClass + '">' + categoryInfo.label + '</span>',
        '  </div>',
        documentItem.description ? '  <p class="card-description">' + escapeHtml(documentItem.description) + '</p>' : '',
        documentItem.keywords ? '  <p class="card-keywords">' + escapeHtml(documentItem.keywords) + '</p>' : '',
        '  <p class="card-meta">Upload Date: ' + escapeHtml(documentItem.uploadDate || '') + '</p>',
        '</div>',
        '<div class="card-footer">',
        '  <button class="btn-action view-btn" type="button" data-action="view" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-eye"></i> View',
        '  </button>',
        '  <button class="btn-action download-btn" type="button" data-action="download" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-download"></i> Download',
        '  </button>',
        '  <button class="btn-action edit-btn" type="button" data-action="edit" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-pen"></i> Edit',
        '  </button>',
        '  <button class="btn-action delete-btn" type="button" data-action="delete" data-id="' + documentItem.id + '">',
        '    <i class="fa-solid fa-trash"></i> Delete',
        '  </button>',
        '</div>'
    ].join('');

    card.querySelector('[data-action="favorite"]').addEventListener('click', function () {
        TrustVaultStorage.toggleFavoriteDocument(documentItem.id);
        renderDocuments();
    });

    card.querySelector('[data-action="view"]').addEventListener('click', function () {
        showPreviewModal(documentItem);
    });

    card.querySelector('[data-action="download"]').addEventListener('click', function () {
        triggerDownload(documentItem);
    });

    card.querySelector('[data-action="edit"]').addEventListener('click', function () {
        showEditModal(documentItem);
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', function () {
        if (confirm('Delete this document?')) {
            TrustVaultStorage.deleteDocument(documentItem.id);
            renderDocuments();
        }
    });

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

function showPreviewModal(documentItem) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = [
        '<div class="modal-card">',
        '  <h3>Document Preview</h3>',
        '  <p><strong>Name:</strong> ' + escapeHtml(documentItem.name || documentItem.fileName) + '</p>',
        '  <p><strong>Category:</strong> ' + escapeHtml(documentItem.category || 'Other') + '</p>',
        '  <p><strong>Size:</strong> ' + escapeHtml(documentItem.fileSize || '0 Bytes') + '</p>',
        '  <p><strong>Uploaded:</strong> ' + escapeHtml(documentItem.uploadDate || '') + '</p>',
        '  <p><strong>Description:</strong> ' + escapeHtml(documentItem.description || 'No description added.') + '</p>',
        '  <p><strong>Keywords:</strong> ' + escapeHtml(documentItem.keywords || 'None') + '</p>',
        '  <div class="modal-actions">',
        '    <button type="button" class="btn-cancel" data-close="true">Close</button>',
        '  </div>',
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
}

function triggerDownload(documentItem) {
    const content = [
        'Name: ' + (documentItem.name || documentItem.fileName),
        'Category: ' + (documentItem.category || 'Other'),
        'Description: ' + (documentItem.description || 'No description added.'),
        'Keywords: ' + (documentItem.keywords || 'None')
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = (documentItem.name || documentItem.fileName || 'document') + '.txt';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
}

function showEditModal(documentItem) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = [
        '<div class="modal-card">',
        '  <h3>Edit Document</h3>',
        '  <form id="editDocumentForm">',
        '    <label class="modal-label">Name</label>',
        '    <input type="text" id="editDocumentName" class="form-input" value="' + escapeHtml(documentItem.name || documentItem.fileName) + '">',
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
        '    <label class="modal-label">Keywords</label>',
        '    <input type="text" id="editDocumentKeywords" class="form-input" value="' + escapeHtml(documentItem.keywords || '') + '">',
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
        const updatedKeywords = document.getElementById('editDocumentKeywords').value.trim();

        if (!updatedName) {
            alert('Please enter a document name.');
            return;
        }

        TrustVaultStorage.updateDocument(documentItem.id, {
            name: updatedName,
            category: updatedCategory,
            description: updatedDescription,
            keywords: updatedKeywords
        });

        modalOverlay.remove();
        renderDocuments();
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addDocumentStyles() {
    if (document.getElementById('documents-page-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'documents-page-styles';
    style.textContent = `
        .documents-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .documents-toolbar input,
        .documents-toolbar select,
        .documents-toolbar button {
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            background: #ffffff;
        }
        .documents-toolbar button.active {
            background: #2563eb;
            color: #ffffff;
            border-color: #2563eb;
        }
        .documents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
        }
        .document-card {
            background-color: #ffffff;
            border-radius: 14px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .card-header {
            padding: 16px 18px;
            background-color: #f8fafc;
            border-bottom: 1px solid #edf2f7;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .favorite-btn {
            border: none;
            background: transparent;
            color: #f59e0b;
            cursor: pointer;
            font-size: 18px;
        }
        .favorite-btn.active {
            color: #f59e0b;
        }
        .card-body {
            padding: 16px 18px;
            flex: 1;
        }
        .card-footer {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            padding: 12px 18px 16px;
            background-color: #f8fafc;
            border-top: 1px solid #edf2f7;
        }
        .btn-action {
            flex: 1;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            color: #4a5568;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
        }
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 1000;
        }
        .modal-card {
            background: #ffffff;
            border-radius: 14px;
            width: min(480px, 100%);
            padding: 20px;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
        }
        .modal-card h3 { margin-top: 0; }
        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 14px;
        }
        .btn-cancel, .btn-submit {
            border: none;
            padding: 10px 14px;
            border-radius: 8px;
            cursor: pointer;
        }
        .btn-cancel { background: #e5e7eb; }
        .btn-submit { background: #2563eb; color: #ffffff; }
        .empty-state {
            background: #ffffff;
            border-radius: 14px;
            padding: 24px;
            text-align: center;
            color: #64748b;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }
    `;
    document.head.appendChild(style);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
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
