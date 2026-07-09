(function (global) {
    const STORAGE_KEY = 'trustVaultDocuments';
    const DEFAULT_FOLDERS = ['Personal', 'Business', 'Government', 'Banking', 'Family', 'Archive'];

    function createId() {
        return 'doc-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
    }

    function getTimestamp() {
        const now = new Date();
        return now.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatFileSize(value) {
        if (!value || value === 0) {
            return '0 Bytes';
        }

        if (typeof value === 'string' && /[a-zA-Z]/.test(value)) {
            return value;
        }

        const bytes = Number(value);
        if (Number.isNaN(bytes)) {
            return '0 Bytes';
        }

        const units = ['Bytes', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const size = bytes / Math.pow(1024, index);
        return size.toFixed(index === 0 ? 0 : 1) + ' ' + units[index];
    }

    function getMockFileSize(source) {
        if (source && source.fileSize) {
            return formatFileSize(source.fileSize);
        }

        if (source && source.size) {
            return formatFileSize(source.size);
        }

        const fileName = String(source && (source.fileName || source.name || 'document.pdf'));
        const extension = fileName.split('.').pop().toLowerCase();
        const multiplier = extension === 'pdf' ? 2.4 : extension === 'png' ? 1.6 : extension === 'jpg' || extension === 'jpeg' ? 1.2 : 1.0;
        return formatFileSize(Math.round(multiplier * 1024 * 1024));
    }

    function normalizeKeywords(keywords) {
        if (Array.isArray(keywords)) {
            return keywords.join(', ');
        }

        return String(keywords || '').trim();
    }

    function normalizeFolder(folderValue) {
        const normalized = String(folderValue || '').trim();
        if (!normalized) {
            return 'Personal';
        }

        return DEFAULT_FOLDERS.indexOf(normalized) !== -1 ? normalized : normalized;
    }

    function normalizeDocument(documentData) {
        const source = documentData || {};
        const name = source.name || source.documentName || source.fileName || 'Untitled Document';
        const category = source.category || 'other';
        const description = source.description || '';
        const keywords = normalizeKeywords(source.keywords);
        const uploadDate = source.uploadDate || source.uploadedAt || getTimestamp();
        const fileSize = source.fileSize || getMockFileSize(source);

        return {
            id: source.id ? String(source.id) : createId(),
            name: String(name),
            category: String(category),
            description: String(description),
            keywords: String(keywords),
            uploadDate: String(uploadDate),
            fileSize: String(fileSize),
            fileName: source.fileName || String(name),
            fileType: source.fileType || '',
            isFavorite: Boolean(source.isFavorite),
            folder: normalizeFolder(source.folder)
        };
    }

    function readDocuments() {
        try {
            const storedValue = localStorage.getItem(STORAGE_KEY);
            if (!storedValue) {
                return [];
            }

            const parsedValue = JSON.parse(storedValue);
            if (!Array.isArray(parsedValue)) {
                return [];
            }

            return parsedValue.map(normalizeDocument);
        } catch (error) {
            console.warn('Unable to read documents from localStorage:', error);
            return [];
        }
    }

    function persistDocuments(documents) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }

    function saveDocument(documentData) {
        const documents = readDocuments();
        const normalizedDocument = normalizeDocument(documentData);
        documents.unshift(normalizedDocument);
        persistDocuments(documents);
        return normalizedDocument;
    }

    function getDocuments() {
        return readDocuments();
    }

    function deleteDocument(id) {
        const remainingDocuments = readDocuments().filter(function (documentItem) {
            return String(documentItem.id) !== String(id);
        });
        persistDocuments(remainingDocuments);
        return remainingDocuments;
    }

    function updateDocument(id, updatedData) {
        const documents = readDocuments();
        const targetIndex = documents.findIndex(function (documentItem) {
            return String(documentItem.id) === String(id);
        });

        if (targetIndex === -1) {
            return null;
        }

        const nextDocument = Object.assign({}, documents[targetIndex], updatedData, {
            name: updatedData.name !== undefined ? String(updatedData.name) : documents[targetIndex].name,
            category: updatedData.category !== undefined ? String(updatedData.category) : documents[targetIndex].category,
            description: updatedData.description !== undefined ? String(updatedData.description) : documents[targetIndex].description,
            keywords: updatedData.keywords !== undefined ? normalizeKeywords(updatedData.keywords) : documents[targetIndex].keywords,
            fileSize: updatedData.fileSize !== undefined ? String(updatedData.fileSize) : documents[targetIndex].fileSize,
            isFavorite: updatedData.isFavorite !== undefined ? Boolean(updatedData.isFavorite) : documents[targetIndex].isFavorite,
            folder: updatedData.folder !== undefined ? normalizeFolder(updatedData.folder) : documents[targetIndex].folder
        });

        documents[targetIndex] = nextDocument;
        persistDocuments(documents);
        return nextDocument;
    }

    function toggleFavoriteDocument(id) {
        const documents = readDocuments();
        const targetIndex = documents.findIndex(function (documentItem) {
            return String(documentItem.id) === String(id);
        });

        if (targetIndex === -1) {
            return null;
        }

        documents[targetIndex].isFavorite = !documents[targetIndex].isFavorite;
        persistDocuments(documents);
        return documents[targetIndex];
    }

    function renameDocument(id, newName) {
        return updateDocument(id, { name: newName });
    }

    function moveDocument(id, folder) {
        return updateDocument(id, { folder: folder });
    }

    function copyDocument(id, folder) {
        const documents = readDocuments();
        const sourceDocument = documents.find(function (documentItem) {
            return String(documentItem.id) === String(id);
        });

        if (!sourceDocument) {
            return null;
        }

        const nextDocument = Object.assign({}, sourceDocument, {
            id: createId(),
            name: 'Copy of ' + (sourceDocument.name || sourceDocument.fileName || 'Document'),
            uploadDate: getTimestamp(),
            folder: normalizeFolder(folder || sourceDocument.folder || 'Personal')
        });

        documents.unshift(nextDocument);
        persistDocuments(documents);
        return nextDocument;
    }

    function clearDocuments() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function getDefaultFolders() {
        return DEFAULT_FOLDERS.slice();
    }

    global.TrustVaultStorage = {
        saveDocument: saveDocument,
        getDocuments: getDocuments,
        deleteDocument: deleteDocument,
        updateDocument: updateDocument,
        toggleFavoriteDocument: toggleFavoriteDocument,
        renameDocument: renameDocument,
        moveDocument: moveDocument,
        copyDocument: copyDocument,
        clearDocuments: clearDocuments,
        formatFileSize: formatFileSize,
        getDefaultFolders: getDefaultFolders
    };
})(window);
