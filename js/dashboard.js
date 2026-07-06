document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();

    const dashboardUserName = document.getElementById('dashboardUserName');
    const metricContracts = document.getElementById('metricContracts');
    const metricContractsMeta = document.getElementById('metricContractsMeta');
    const metricDocuments = document.getElementById('metricDocuments');
    const metricDocumentsMeta = document.getElementById('metricDocumentsMeta');
    const metricAlerts = document.getElementById('metricAlerts');
    const metricAlertsMeta = document.getElementById('metricAlertsMeta');
    const metricActivity = document.getElementById('metricActivity');
    const metricActivityMeta = document.getElementById('metricActivityMeta');
    const contractsList = document.getElementById('contractsList');
    const filesList = document.getElementById('filesList');
    const alertsList = document.getElementById('alertsList');
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonth = document.getElementById('calendarMonth');

    const currentUser = getCurrentUser();
    if (dashboardUserName) {
        dashboardUserName.textContent = currentUser && currentUser.username ? currentUser.username : 'Investor';
    }

    const documents = TrustVaultStorage.getDocuments();
    const contracts = getContractMocks();
    const alerts = getAlertMocks();

    if (metricContracts) {
        metricContracts.textContent = contracts.length;
    }
    if (metricContractsMeta) {
        metricContractsMeta.textContent = 'Signed and pending';
    }

    if (metricDocuments) {
        metricDocuments.textContent = documents.length;
    }
    if (metricDocumentsMeta) {
        metricDocumentsMeta.textContent = documents.length ? 'Live local records' : 'No records yet';
    }

    if (metricAlerts) {
        metricAlerts.textContent = alerts.length;
    }
    if (metricAlertsMeta) {
        metricAlertsMeta.textContent = 'Review priority items';
    }

    if (metricActivity) {
        const lastDocument = documents[0];
        metricActivity.textContent = lastDocument && lastDocument.uploadDate ? lastDocument.uploadDate : 'Today';
    }
    if (metricActivityMeta) {
        metricActivityMeta.textContent = documents.length ? 'Latest activity' : 'Awaiting uploads';
    }

    renderContracts(contractsList, contracts);
    renderFiles(filesList, documents);
    renderAlerts(alertsList, alerts);
    renderCalendar(calendarGrid, calendarMonth);
});

function getContractMocks() {
    return [
        { title: 'Shareholder Agreement', status: 'Signed', date: '2026-07-03' },
        { title: 'Vendor NDA', status: 'Pending', date: '2026-07-02' },
        { title: 'Board Resolution', status: 'Review', date: '2026-06-30' }
    ];
}

function getAlertMocks() {
    return [
        { title: '2 documents need review', detail: 'Pending verification', severity: 'High' },
        { title: 'Contract renewal due soon', detail: 'Next week', severity: 'Medium' },
        { title: 'Security audit complete', detail: 'No further action', severity: 'Low' }
    ];
}

function renderContracts(container, contracts) {
    if (!container) {
        return;
    }

    if (!contracts.length) {
        container.innerHTML = '<li class="list-item"><div><strong>No contracts</strong><span>Nothing to display</span></div></li>';
        return;
    }

    container.innerHTML = contracts.slice(0, 3).map(function (contract) {
        return '<li class="list-item"><div><strong>' + escapeHtml(contract.title) + '</strong><span>' + escapeHtml(contract.date) + '</span></div><button type="button">' + escapeHtml(contract.status) + '</button></li>';
    }).join('');
}

function renderFiles(container, documents) {
    if (!container) {
        return;
    }

    const recentDocuments = documents.slice(0, 3);

    if (!recentDocuments.length) {
        container.innerHTML = '<li class="list-item"><div><strong>No files yet</strong><span>Upload a document to populate</span></div></li>';
        return;
    }

    container.innerHTML = recentDocuments.map(function (documentItem) {
        return '<li class="list-item"><div><strong>' + escapeHtml(documentItem.name || documentItem.fileName) + '</strong><span>' + escapeHtml(documentItem.category || 'Document') + '</span></div><button type="button">Open</button></li>';
    }).join('');
}

function renderAlerts(container, alerts) {
    if (!container) {
        return;
    }

    container.innerHTML = alerts.map(function (alertItem) {
        return '<li class="list-item"><div><strong>' + escapeHtml(alertItem.title) + '</strong><span>' + escapeHtml(alertItem.detail) + '</span></div><button type="button">' + escapeHtml(alertItem.severity) + '</button></li>';
    }).join('');
}

function renderCalendar(container, monthLabel) {
    if (!container) {
        return;
    }

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = [29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];
    const activeDay = 14;

    if (monthLabel) {
        monthLabel.textContent = 'July 2026';
    }

    container.innerHTML = days.map(function (day) {
        return '<div class="calendar-day">' + escapeHtml(day) + '</div>';
    }).join('') + dates.map(function (day, index) {
        const isMuted = index < 2 || index > 30;
        const isActive = day === activeDay;
        const classes = 'calendar-day' + (isMuted ? ' muted' : '') + (isActive ? ' active' : '');
        return '<div class="' + classes + '">' + day + '</div>';
    }).join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
