# TrustVault - Sprint 2 Progress Report

## Features Implemented:
1. **Document Upload UI (`upload.html`)**: Created a clean and simple interface for local document uploading.
2. **Local Storage Service (`storage.js`)**: Integrated HTML5 localStorage to handle persistent saving, retrieving, and managing of documents completely client-side.
3. **Search Mechanism**: Implemented localized search functions to scan and filter through saved documents cleanly.
4. **Upload Validation**: Added validation rules checking for:
   - Empty files
   - Oversized files (over 5 MB)
   - Unsupported file types/extensions
   - Missing document names or categories