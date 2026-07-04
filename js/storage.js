(function (global) {
    const STORAGE_KEY = 'trustVaultDocuments';

    function createId() {
        return 'doc-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
    }

    function getTimestamp() {
        const now = new Date();
        return now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function normalizeDocument(documentData) {
        return {
            id: documentData && documentData.id ? String(documentData.id) : createId(),
            fileName: documentData && documentData.fileName ? documentData.fileName : 'document.pdf',
            fileType: documentData && documentData.fileType ? documentData.fileType : '',
            documentName: documentData && documentData.documentName ? documentData.documentName : 'Untitled Document',
            category: documentData && documentData.category ? documentData.category : 'other',
            description: documentData && documentData.description ? documentData.description : '',
            size: documentData && documentData.size ? documentData.size : 0,
            uploadedAt: documentData && documentData.uploadedAt ? documentData.uploadedAt : getTimestamp()
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

        documents[targetIndex] = Object.assign({}, documents[targetIndex], updatedData, {
            documentName: updatedData.documentName || documents[targetIndex].documentName,
            category: updatedData.category || documents[targetIndex].category,
            description: updatedData.description !== undefined ? updatedData.description : documents[targetIndex].description
        });

        persistDocuments(documents);
        return documents[targetIndex];
    }

    function clearDocuments() {
        localStorage.removeItem(STORAGE_KEY);
    }

    global.TrustVaultStorage = {
        saveDocument: saveDocument,
        getDocuments: getDocuments,
        deleteDocument: deleteDocument,
        updateDocument: updateDocument,
        clearDocuments: clearDocuments
    };
})(window);
