(function (global) {
    const STORAGE_KEY = 'trustVaultDocuments';

    const DEFAULT_DOCUMENTS = [
        {
            id: 'sample-passport',
            fileName: 'Passport.pdf',
            documentName: 'Passport',
            category: 'identity',
            description: 'Primary passport copy',
            fileSize: 2400000,
            uploadTime: '2026-07-05 09:00'
        },
        {
            id: 'sample-bank',
            fileName: 'Bank Statement.pdf',
            documentName: 'Bank Statement',
            category: 'financial',
            description: 'Monthly statement for verification',
            fileSize: 1800000,
            uploadTime: '2026-07-05 10:30'
        }
    ];

    function normalizeDocument(documentData) {
        return {
            id: documentData.id || createId(),
            fileName: documentData.fileName || 'Untitled Document',
            documentName: documentData.documentName || documentData.fileName || 'Untitled Document',
            category: documentData.category || 'other',
            description: documentData.description || '',
            fileSize: documentData.fileSize || 0,
            uploadTime: documentData.uploadTime || new Date().toLocaleString(),
            fileType: documentData.fileType || ''
        };
    }

    function createId() {
        return 'doc-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    }

    function readDocuments() {
        try {
            const storedValue = localStorage.getItem(STORAGE_KEY);
            if (!storedValue) {
                persistDocuments(DEFAULT_DOCUMENTS);
                return DEFAULT_DOCUMENTS.map(normalizeDocument);
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

    function getDocuments() {
        return readDocuments();
    }

    function saveDocument(documentData) {
        const documents = readDocuments();
        const normalizedDocument = normalizeDocument(documentData);
        documents.unshift(normalizedDocument);
        persistDocuments(documents);
        return normalizedDocument;
    }

    function updateDocument(id, updates) {
        const documents = readDocuments();
        const targetIndex = documents.findIndex(function (documentItem) {
            return String(documentItem.id) === String(id);
        });

        if (targetIndex === -1) {
            return null;
        }

        documents[targetIndex] = normalizeDocument(Object.assign({}, documents[targetIndex], updates));
        persistDocuments(documents);
        return documents[targetIndex];
    }

    function deleteDocument(id) {
        const documents = readDocuments();
        const remainingDocuments = documents.filter(function (documentItem) {
            return String(documentItem.id) !== String(id);
        });
        persistDocuments(remainingDocuments);
        return remainingDocuments;
    }

    function getDocumentById(id) {
        return readDocuments().find(function (documentItem) {
            return String(documentItem.id) === String(id);
        }) || null;
    }

    function getDocumentsByCategory(category) {
        return readDocuments().filter(function (documentItem) {
            return documentItem.category === category;
        });
    }

    function clearDocuments() {
        localStorage.removeItem(STORAGE_KEY);
    }

    global.TrustVaultStorage = {
        getDocuments: getDocuments,
        saveDocument: saveDocument,
        updateDocument: updateDocument,
        deleteDocument: deleteDocument,
        getDocumentById: getDocumentById,
        getDocumentsByCategory: getDocumentsByCategory,
        clearDocuments: clearDocuments
    };
})(window);
