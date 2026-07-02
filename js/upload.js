// ============================================
// UPLOAD PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeUploadPage();
});

/**
 * Initialize the upload page
 */
function initializeUploadPage() {
    setupDragDropZone();
    setupFormSubmission();
    setupFormValidation();
}

/**
 * Setup drag and drop zone
 */
function setupDragDropZone() {
    const dragDropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.querySelector('.btn-browse');

    // Browse button click
    browseBtn.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dragDropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dragDropZone.addEventListener('drop', handleDrop, false);

    /**
     * Prevent default drag behaviors
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Highlight drop zone
     */
    function highlight(e) {
        dragDropZone.classList.add('dragover');
    }

    /**
     * Unhighlight drop zone
     */
    function unhighlight(e) {
        dragDropZone.classList.remove('dragover');
    }

    /**
     * Handle dropped files
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG files.');
        return;
    }

    // Update preview
    const zoneContent = document.querySelector('.zone-content');
    const zonePreview = document.getElementById('zonePreview');
    const previewText = document.getElementById('previewText');

    zoneContent.style.display = 'none';
    zonePreview.style.display = 'flex';
    previewText.textContent = `✓ ${file.name} (${formatFileSize(file.size)})`;

    // Auto-fill document name if empty
    const docNameInput = document.getElementById('docName');
    if (!docNameInput.value) {
        docNameInput.value = file.name.split('.')[0];
    }

    // Store file for later upload
    window.selectedFile = file;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
    const form = document.getElementById('uploadForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!window.selectedFile) {
            alert('Please select a file to upload');
            return;
        }

        const formData = {
            fileName: window.selectedFile.name,
            documentName: document.getElementById('docName').value,
            category: document.getElementById('docCategory').value,
            description: document.getElementById('docDescription').value,
            fileSize: window.selectedFile.size,
            uploadTime: new Date().toLocaleString()
        };

        simulateUpload(formData);
    });
}

/**
 * Simulate upload process
 */
function simulateUpload(formData) {
    const uploadForm = document.querySelector('.upload-form-container');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatus = document.getElementById('progressStatus');

    // Hide form, show progress
    uploadForm.style.display = 'none';
    uploadProgress.style.display = 'block';

    let currentProgress = 0;
    const statusMessages = [
        'Validating file...',
        'Preparing upload...',
        'Encrypting document...',
        'Uploading to secure storage...',
        'Finalizing...',
        'Upload complete!'
    ];

    let messageIndex = 0;
    const progressInterval = setInterval(() => {
        // Update progress
        currentProgress += Math.random() * 25;
        if (currentProgress > 100) currentProgress = 100;

        progressFill.style.width = currentProgress + '%';
        progressPercent.textContent = Math.floor(currentProgress) + '%';

        // Update status message
        if (messageIndex < statusMessages.length && currentProgress > (messageIndex * 16.67)) {
            progressStatus.textContent = statusMessages[messageIndex];
            messageIndex++;
        }

        // Upload complete
        if (currentProgress === 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                showSuccessMessage(formData);
            }, 500);
        }
    }, 300);

    // Save to local storage for demonstration
    saveUploadedDocument(formData);
}

/**
 * Show success message
 */
function showSuccessMessage(formData) {
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const successMessage = document.getElementById('successMessage');

    uploadProgress.style.display = 'none';
    uploadSuccess.style.display = 'block';

    successMessage.textContent = `"${formData.documentName}" has been successfully uploaded to the ${formData.category} category.`;

    // Setup upload more button
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    uploadMoreBtn.addEventListener('click', resetForm);
}

/**
 * Reset form for another upload
 */
function resetForm() {
    window.selectedFile = null;
    
    // Reset form
    document.getElementById('uploadForm').reset();
    
    // Show form, hide success
    const uploadForm = document.querySelector('.upload-form-container');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const zoneContent = document.querySelector('.zone-content');
    const zonePreview = document.getElementById('zonePreview');

    uploadForm.style.display = 'block';
    uploadSuccess.style.display = 'none';
    zoneContent.style.display = 'flex';
    zonePreview.style.display = 'none';

    // Reset progress
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0%';
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const docNameInput = document.getElementById('docName');
    const docCategorySelect = document.getElementById('docCategory');

    docNameInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.style.borderColor = '#dc2626';
        } else {
            this.style.borderColor = '#cbd5e0';
        }
    });

    docCategorySelect.addEventListener('change', function() {
        if (this.value === '') {
            this.style.borderColor = '#cbd5e0';
        } else {
            this.style.borderColor = '#cbd5e0';
        }
    });
}

/**
 * Save uploaded document to localStorage
 */
function saveUploadedDocument(formData) {
    let documents = JSON.parse(localStorage.getItem('trustVaultDocuments')) || [];
    
    documents.push({
        id: Date.now(),
        ...formData
    });

    localStorage.setItem('trustVaultDocuments', JSON.stringify(documents));
    console.log('Document saved to localStorage:', formData);
}

/**
 * Retrieve uploaded documents from localStorage
 */
function getUploadedDocuments() {
    return JSON.parse(localStorage.getItem('trustVaultDocuments')) || [];
}
