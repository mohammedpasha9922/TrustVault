// ============================================
// UPLOAD PAGE FUNCTIONALITY
// ============================================

const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
];

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
    if (!isAllowedFile(file)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files.');
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
        previewText.textContent = '✓ ' + file.name + ' (' + formatFileSize(file.size) + ')';
    }

    if (docNameInput && !docNameInput.value.trim()) {
        docNameInput.value = file.name.split('.')[0];
    }
}

function isAllowedFile(file) {
    const extension = (file.name || '').split('.').pop().toLowerCase();
    const extensionMatches = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'].includes(extension);
    const typeMatches = ALLOWED_TYPES.includes(file.type);
    return extensionMatches || typeMatches;
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

function setupFormSubmission() {
    const form = document.getElementById('uploadForm');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const documentName = document.getElementById('docName').value.trim();
        const category = document.getElementById('docCategory').value;

        if (!uploadState.selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        if (!documentName || !category) {
            alert('Please enter a document name and choose a category.');
            return;
        }

        const formData = {
            id: Date.now(),
            fileName: uploadState.selectedFile.name,
            documentName: documentName,
            category: category,
            description: document.getElementById('docDescription').value.trim(),
            fileSize: uploadState.selectedFile.size,
            uploadTime: new Date().toLocaleString()
        };

        saveUploadedDocument(formData);
        showUploadProgress(formData);
    });
}

function showUploadProgress(formData) {
    const uploadForm = document.querySelector('.upload-form-container');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatus = document.getElementById('progressStatus');

    if (!uploadForm || !uploadProgress || !progressFill || !progressPercent || !progressStatus) {
        return;
    }

    uploadForm.style.display = 'none';
    uploadProgress.style.display = 'block';

    const steps = [
        { progress: 25, message: 'Validating file...' },
        { progress: 55, message: 'Preparing upload...' },
        { progress: 80, message: 'Saving document securely...' },
        { progress: 100, message: 'Upload complete!' }
    ];

    let index = 0;
    const timer = window.setInterval(function () {
        const step = steps[index];
        progressFill.style.width = step.progress + '%';
        progressPercent.textContent = step.progress + '%';
        progressStatus.textContent = step.message;

        index += 1;

        if (index >= steps.length) {
            window.clearInterval(timer);
            window.setTimeout(function () {
                showSuccessMessage(formData);
            }, 400);
        }
    }, 300);
}

function showSuccessMessage(formData) {
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const successMessage = document.getElementById('successMessage');
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');

    if (!uploadProgress || !uploadSuccess || !successMessage) {
        return;
    }

    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'block';
    successMessage.textContent = '"' + formData.documentName + '" has been saved to your TrustVault documents.';

    if (uploadMoreBtn) {
        uploadMoreBtn.addEventListener('click', resetForm);
    }
}

function resetForm() {
    uploadState.selectedFile = null;

    document.getElementById('uploadForm').reset();

    const uploadForm = document.querySelector('.upload-form-container');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const zoneContent = document.querySelector('.zone-content');
    const zonePreview = document.getElementById('zonePreview');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');

    if (uploadForm) {
        uploadForm.style.display = 'block';
    }

    if (uploadSuccess) {
        uploadSuccess.style.display = 'none';
    }

    if (zoneContent && zonePreview) {
        zoneContent.style.display = 'flex';
        zonePreview.style.display = 'none';
    }

    if (progressFill) {
        progressFill.style.width = '0%';
    }

    if (progressPercent) {
        progressPercent.textContent = '0%';
    }
}

function setupFormValidation() {
    const docNameInput = document.getElementById('docName');
    const docCategorySelect = document.getElementById('docCategory');

    if (!docNameInput || !docCategorySelect) {
        return;
    }

    docNameInput.addEventListener('blur', function () {
        if (this.value.trim() === '') {
            this.style.borderColor = '#dc2626';
        } else {
            this.style.borderColor = '#cbd5e0';
        }
    });

    docCategorySelect.addEventListener('change', function () {
        this.style.borderColor = '#cbd5e0';
    });
}

function saveUploadedDocument(formData) {
    return TrustVaultStorage.saveDocument(formData);
}

function getUploadedDocuments() {
    return TrustVaultStorage.getDocuments();
}

window.getUploadedDocuments = getUploadedDocuments;
