const ALLOWED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg'
];
const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const uploadState = {
    selectedFile: null
};

document.addEventListener('DOMContentLoaded', function () {
    initializeUploadPage();
});

function initializeUploadPage() {
    setupDragDropZone();
    setupFormSubmission();
    setupFormValidation();
}

function setupDragDropZone() {
    const dragDropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.querySelector('.btn-browse');

    if (!dragDropZone || !fileInput || !browseBtn) {
        return;
    }

    browseBtn.addEventListener('click', function (event) {
        event.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        if (this.files && this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
        dragDropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(function (eventName) {
        dragDropZone.addEventListener(eventName, highlightZone, false);
    });

    ['dragleave', 'drop'].forEach(function (eventName) {
        dragDropZone.addEventListener(eventName, unhighlightZone, false);
    });

    dragDropZone.addEventListener('drop', function (event) {
        const droppedFile = event.dataTransfer && event.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    }, false);

    function preventDefaults(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function highlightZone() {
        dragDropZone.classList.add('dragover');
    }

    function unhighlightZone() {
        dragDropZone.classList.remove('dragover');
    }
}

function handleFileSelect(file) {
    const validation = validateSelectedFile(file);

    if (!validation.valid) {
        uploadState.selectedFile = null;
        alert(validation.message);
        return;
    }

    uploadState.selectedFile = file;

    const zoneContent = document.querySelector('.zone-content');
    const zonePreview = document.getElementById('zonePreview');
    const previewText = document.getElementById('previewText');
    const docNameInput = document.getElementById('docName');

    if (zoneContent && zonePreview && previewText) {
        zoneContent.style.display = 'none';
        zonePreview.style.display = 'flex';
        previewText.textContent = '✓ ' + file.name + ' (' + getFileSizeLabel(file) + ')';
    }

    if (docNameInput && !docNameInput.value.trim()) {
        docNameInput.value = file.name.split('.')[0];
    }
}

function validateSelectedFile(file) {
    if (!file) {
        return { valid: false, message: 'Please select a file to upload.' };
    }

    if (file.size === 0) {
        return { valid: false, message: 'The selected file is empty. Please choose a valid document.' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, message: 'The selected file is too large. Please upload a document smaller than 5 MB.' };
    }

    if (!isAllowedFile(file)) {
        return { valid: false, message: 'Please choose a valid PDF, JPG, or PNG file.' };
    }

    return { valid: true, message: '' };
}

function isAllowedFile(file) {
    const extension = (file.name || '').split('.').pop().toLowerCase();
    const extensionMatches = ALLOWED_EXTENSIONS.includes(extension);
    const typeMatches = ALLOWED_TYPES.includes(file.type);
    return extensionMatches || typeMatches;
}

function getFileSizeLabel(file) {
    if (!file) {
        return '0 Bytes';
    }

    if (file.size && file.size > 0) {
        return formatFileSize(file.size);
    }

    const extension = (file.name || '').split('.').pop().toLowerCase();
    const multiplier = extension === 'pdf' ? 2.4 : extension === 'png' ? 1.6 : extension === 'jpg' || extension === 'jpeg' ? 1.2 : 1.0;
    return formatFileSize(Math.round(multiplier * 1024 * 1024));
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

function createUploadId() {
    return 'doc-' + Date.now() + '-' + Math.random().toString(16).slice(2, 8);
}

function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function setupFormSubmission() {
    const form = document.getElementById('uploadForm');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const documentName = document.getElementById('docName').value.trim();
        const category = document.getElementById('docCategory').value;
        const description = document.getElementById('docDescription').value.trim();
        const keywords = document.getElementById('docKeywords').value.trim();
        const folder = document.getElementById('docFolder').value || 'Personal';
        const validation = validateUploadForm(uploadState.selectedFile, documentName, category, description);

        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        const formData = {
            id: createUploadId(),
            name: documentName,
            category: category,
            description: description,
            keywords: keywords,
            uploadDate: getCurrentTimestamp(),
            fileSize: getFileSizeLabel(uploadState.selectedFile),
            fileName: uploadState.selectedFile.name,
            fileType: uploadState.selectedFile.type || 'application/octet-stream',
            folder: folder
        };

        TrustVaultStorage.saveDocument(formData);
        window.location.assign('documents.html');
    });
}

function validateUploadForm(file, documentName, category, description) {
    const fileValidation = validateSelectedFile(file);

    if (!fileValidation.valid) {
        return fileValidation;
    }

    if (!documentName.trim()) {
        return { valid: false, message: 'Please enter a document name.' };
    }

    if (!category) {
        return { valid: false, message: 'Please choose a category for the document.' };
    }

    if (!description.trim()) {
        return { valid: false, message: 'Please enter a document description.' };
    }

    return { valid: true, message: '' };
}

function setupFormValidation() {
    const docNameInput = document.getElementById('docName');
    const docCategorySelect = document.getElementById('docCategory');

    if (!docNameInput || !docCategorySelect) {
        return;
    }

    docNameInput.addEventListener('blur', function () {
        this.style.borderColor = this.value.trim() ? '#cbd5e0' : '#dc2626';
    });

    docCategorySelect.addEventListener('change', function () {
        this.style.borderColor = this.value ? '#cbd5e0' : '#dc2626';
    });
}

