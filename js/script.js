/*
    Nama File: script.js
    Lokasi: js/script.js
    Status: Diperbaiki - Gabungan fungsi cek nilai dan cek nomor urut
*/

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdpzadRtH-72k6Yjk9o_IEXd4aMui5oz9SjhLCBH2-KK5M7mw/viewform?embedded=true';
const TARGET_DATE_STRING = '2025-10-29T08:00:00+07:00';

// ===== INISIALISASI UTAMA =====
let mtqDataManager;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded - Current Page:', window.location.pathname);
    
    // Mobile Toggle untuk semua halaman
    initializeMobileToggle();
    
    // Inisialisasi berdasarkan halaman
    initializePageSpecificFeatures();
    
    // Event listeners untuk admin (hanya jika elemen ada)
    initializeAdminFeatures();
});

// ===== FUNGSI INISIALISASI =====

function initializeMobileToggle() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbarMenu = document.getElementById('navbar-menu');
    
    if (mobileToggle && navbarMenu) {
        mobileToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }
}

function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname;
    
    // Halaman utama (index.html)
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
        initializeMainPage();
    }
    
    // Halaman admin
    else if (currentPage.includes('admin-dashboard.html')) {
        initializeAdminPage();
    }
    
    // Halaman login
    else if (currentPage.includes('login.html')) {
        initializeLoginPage();
    }
    
    // Halaman cek nilai
    else if (currentPage.includes('nilai.html') || currentPage.includes('cek-nilai.html')) {
        initializeCekNilaiPage();
    }
    
    // Halaman cek nomor urut
    else if (currentPage.includes('urut-tampil.html') || currentPage.includes('cek-no-urut.html')) {
        initializeCekNoUrutPage();
    }
    
    // Tombol Cek Nilai & Cek Nomor (untuk semua halaman yang memiliki tombol ini)
    initializeCommonButtons();
}

function initializeMainPage() {
    console.log('Initializing Main Page Features');
    
    // Inisialisasi MTQ Data Manager
    if (document.getElementById('data-container')) {
        mtqDataManager = new MTQDataManager();
        
        // Lazy load iframe peta lokasi
        const locationIframe = document.querySelector('.location-wrapper iframe');
        if (locationIframe) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    locationIframe.src = locationIframe.getAttribute('data-src');
                    observer.unobserve(locationIframe);
                }
            });
            observer.observe(locationIframe);
        }
    }
}

function initializeAdminPage() {
    console.log('Initializing Admin Page Features');
    checkAuth(); // Hanya di halaman admin kita check auth
    
    // Auto logout untuk admin saja
    setInterval(() => {
        const loginTime = localStorage.getItem('mtq_login_time');
        if (loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff > 12) {
                alert('Sesi telah berakhir. Silakan login kembali.');
                logout();
            }
        }
    }, 60000);
}

function initializeLoginPage() {
    console.log('Initializing Login Page Features');
    checkExistingLogin(); // Redirect ke admin jika sudah login
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('error-message');
            const errorText = document.getElementById('error-text');

            if (VALID_USERS[username] && VALID_USERS[username] === password) {
                // Login sukses
                localStorage.setItem('mtq_admin_logged_in', 'true');
                localStorage.setItem('mtq_admin_user', username);
                localStorage.setItem('mtq_login_time', new Date().toISOString());
                
                errorElement.classList.remove('show');
                window.location.href = 'admin-dashboard.html';
            } else {
                // Login gagal
                errorText.textContent = 'Username atau password salah. Hanya untuk pewara dan juri.';
                errorElement.classList.add('show');
                
                document.getElementById('password').value = '';
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 500);
            }
        });
    }
}

function initializeCekNilaiPage() {
    console.log('Initializing Cek Nilai Page Features');
    
    // Auto-focus pada input
    const participantInput = document.getElementById('participantId');
    if (participantInput) {
        participantInput.focus();
        
        // Cek URL parameters untuk auto-search
        const urlParams = new URLSearchParams(window.location.search);
        const participantId = urlParams.get('id');
        if (participantId) {
            participantInput.value = participantId;
            setTimeout(() => searchParticipant(), 1000);
        }
    }
}

function initializeCekNoUrutPage() {
    console.log('Initializing Cek No Urut Page Features');
    
    const participantInput = document.getElementById('participantId');
    if (participantInput) {
        participantInput.focus();
        participantInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchParticipant();
            }
        });
        
    }
}

function initializeCommonButtons() {
    // Tombol Cek Nilai (untuk semua halaman yang memiliki tombol ini)
    const cekNilaiBtn = document.getElementById('cek-nilai-btn');
    if (cekNilaiBtn) {
        cekNilaiBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                title: '<strong style="color: #1A3C34;">Cek Nilai MTQ Bantul 2025</strong>',
                html: `
                    <div style="text-align: left; color: #2E4F47;">
                        <p style="margin-bottom: 15px;">Fitur <strong>Cek Nilai</strong> akan segera tersedia untuk melihat hasil penilaian peserta MTQ.</p>
                        <div style="background: #F5F6E8; padding: 15px; border-radius: 8px; border-left: 4px solid #D4A017;">
                            <p style="margin: 0; color: #1A3C34;"><strong>Informasi:</strong></p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Nilai akan tersedia setelah proses penilaian selesai</li>
                                <li>Pastikan Anda memiliki kode peserta yang valid</li>
                                <li>Hubungi panitia jika mengalami kendala</li>
                            </ul>
                        </div>
                    </div>
                `,
                icon: 'info',
                iconColor: '#D4A017',
                showCancelButton: true,
                confirmButtonText: 'Hubungi Panitia',
                cancelButtonText: 'Tutup',
                confirmButtonColor: '#1A3C34',
                cancelButtonColor: '#6c757d',
                customClass: {
                    popup: 'sweetalert-custom-popup'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.open('https://wa.me/6285643238821?text=Halo%20panitia%20MTQ%20Bantul%202025,%20saya%20ingin%20bertanya%20tentang%20nilai%20peserta...', '_blank');
                }
            });
        });
    }

    // Tombol Cek Nomor Urut (untuk semua halaman yang memiliki tombol ini)
    const cekNomorBtn = document.getElementById('cek-nomor-btn');
    if (cekNomorBtn) {
        cekNomorBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                title: '<strong style="color: #1A3C34;">Cek Nomor Urut Peserta</strong>',
                html: `
                    <div style="text-align: left; color: #2E4F47;">
                        <p style="margin-bottom: 15px;">Fitur <strong>Cek Nomor Urut</strong> akan dibuka setelah proses pengundian nomor urut selesai dilakukan.</p>
                        
                        <div style="background: #F5F6E8; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2E4F47;">
                            <p style="margin: 0 0 10px 0; color: #1A3C34;"><strong>Informasi Penting:</strong></p>
                            <ul style="margin: 0; padding-left: 20px; color: #2E4F47;">
                                <li>Nomor urut akan tersedia setelah pengundian resmi</li>
                                <li>Pastikan data peserta sudah terdaftar dengan benar</li>
                                <li>Pengumuman nomor urut akan disampaikan melalui grup official</li>
                            </ul>
                        </div>
                        
                        <div style="background: #e8f4fd; padding: 12px; border-radius: 6px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; color: #0d47a1; font-size: 0.9rem;">
                                <i class="fas fa-info-circle"></i> 
                                <strong>Validasi:</strong> Sistem akan dibuka setelah pengundian nomor urut sebagai validasi proses.
                            </p>
                        </div>
                    </div>
                `,
                icon: 'info',
                iconColor: '#2E4F47',
                confirmButtonText: 'Mengerti',
                confirmButtonColor: '#1A3C34',
                showCloseButton: true,
                width: '600px',
                customClass: {
                    popup: 'sweetalert-custom-popup'
                }
            });
        });
    }
}

function initializeAdminFeatures() {
    // Event listeners untuk admin (hanya jika elemen ada)
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    if (document.getElementById('openAllInput')) {
        document.getElementById('openAllInput').addEventListener('click', openAllInputSheets);
    }
    if (document.getElementById('openAllLCP')) {
        document.getElementById('openAllLCP').addEventListener('click', openAllLCPSheets);
    }
    if (document.getElementById('refreshSheets')) {
        document.getElementById('refreshSheets').addEventListener('click', refreshSheets);
    }
}

// ===== KELAS UTAMA MTQ DATA MANAGER =====

class StatsManager {
    constructor(webAppUrl) {
        this.webAppUrl = webAppUrl;
        this.statsData = { totalPeserta: 0, totalSekolah: 0, totalKapanewon: 0, kategoriLomba: 0 };
    }

    async calculateAllStats() {
        try {
            const response = await fetch(`${this.webAppUrl}?request=stats`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.statsData = data;
            return this.statsData;
        } catch (error) {
            console.error('Error calculating stats:', error);
            return { totalPeserta: 'N/A', totalSekolah: 'N/A', totalKapanewon: 'N/A', kategoriLomba: 'N/A' };
        }
    }

    getStatsForDisplay() {
        return [
            { label: 'Kategori Lomba', value: this.statsData.kategoriLomba, icon: 'fas fa-trophy', color: '#D4A017' },
            { label: 'Kapanewon', value: this.statsData.totalKapanewon, icon: 'fas fa-map-marker-alt', color: '#2E4F47' },
            { label: 'Sekolah Terdaftar', value: this.statsData.totalSekolah, icon: 'fas fa-school', color: '#1A3C34' },
            { label: 'Total Peserta', value: this.statsData.totalPeserta, icon: 'fas fa-users', color: '#D4A017' },
        ];
    }
}

class HijriDateSystem {
    constructor() {
        this.cache = { data: null, lastFetch: null, cacheDuration: 864e5 };
        this.initMonthMapping();
    }
    
    initMonthMapping() {
        this.monthMapping = {
            'Muharram': 'Muharam', 'Muḥarram': 'Muharam', 'Safar': 'Safar', 'Ṣafar': 'Safar',
            'Rabi al-awwal': 'Rabiulawal', 'Rabīʿ al-awwal': 'Rabiulawal', "Rabi' al-awwal": 'Rabiulawal',
            'Rabiul Awal': 'Rabiulawal', 'Rabi al-Awwal': 'Rabiulawal', 'Rabi al-thani': 'Rabiulakhir',
            'Rabīʿ al-thānī': 'Rabiulakhir', "Rabi' al-thani": 'Rabiulakhir', 'Rabiul Akhir': 'Rabiulakhir',
            'Rabi al-Akhir': 'Rabiulakhir', 'Rabi al-Thani': 'Rabiulakhir', 'Jumada al-awwal': 'Jumadilawal',
            'Jumādá al-ūlá': 'Jumadilawal', 'Jumada al-ula': 'Jumadilawal', 'Jumadil Awal': 'Jumadilawal',
            'Jumada al-Awwal': 'Jumadilawal', 'Jumada al-thani': 'Jumadilakhir', 'Jumādá al-ākhirah': 'Jumadilakhir',
            'Jumada al-akhirah': 'Jumadilakhir', 'Jumadil Akhir': 'Jumadilakhir', 'Jumada al-Akhir': 'Jumadilakhir',
            'Jumada al-Thani': 'Jumadilakhir', 'Rajab': 'Rajab', "Sha'ban": 'Syakban', 'Shaʿbān': 'Syakban',
            'Shaban': 'Syakban', 'Shaaban': 'Syakban', 'Ramadan': 'Ramadan', 'Ramaḍān': 'Ramadan',
            'Ramadhan': 'Ramadan', 'Ramadān': 'Ramadan', 'Shawwal': 'Syawal', 'Shawwāl': 'Syawal',
            'Syawal': 'Syawal', "Dhu al-Qi'dah": 'Zulkaidah', 'Dhū al-Qaʿdah': 'Zulkaidah',
            "Dhu al-Qa'dah": 'Zulkaidah', 'Zulkaidah': 'Zulkaidah', 'Dhū al-Qa‘dah': 'Zulkaidah',
            'Dhu al-Qa‘dah': 'Zulkaidah', 'Dhu al-Hijjah': 'Zulhijah', 'Dhū al-Ḥijjah': 'Zulhijah',
            'Zulhijah': 'Zulhijah', 'محرم': 'Muharam', 'صفر': 'Safar', 'ربيع الأول': 'Rabiulawal',
            'ربيع الثاني': 'Rabiulakhir', 'جمادى الأولى': 'Jumadilawal', 'جمادى الآخرة': 'Jumadilakhir',
            'رجب': 'Rajab', 'شعبان': 'Syakban', 'رمضان': 'Ramadan', 'شوال': 'Syawal',
            'ذو القعدة': 'Zulkaidah', 'ذو الحجة': 'Zulhijah'
        };
        
        this.normalizedMapping = {};
        Object.keys(this.monthMapping).forEach(key => {
            const normalizedKey = this.normalizeMonthKey(key);
            this.normalizedMapping[normalizedKey] = this.monthMapping[key];
        });
    }
    
    normalizeMonthKey(monthName) {
        return monthName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }
    
    async getHijriDate() {
        if (this.isCacheValid()) {
            return this.cache.data;
        }
        
        try {
            const hijriDate = await this.fetchHijriDateWithRetry();
            this.cache.data = hijriDate;
            this.cache.lastFetch = Date.now();
            return hijriDate;
        } catch (error) {
            console.error('Error getting Hijri date:', error);
            return this.getFallbackHijriDate();
        }
    }
    
    isCacheValid() {
        return this.cache.data && this.cache.lastFetch && 
            (Date.now() - this.cache.lastFetch) < this.cache.cacheDuration;
    }
    
    async fetchHijriDateWithRetry(retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await this.fetchHijriDate();
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error.message);
                if (attempt === retries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    async fetchHijriDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.code === 200) {
            const hijri = data.data.hijri;
            const monthName = this.normalizeHijriMonth(hijri.month.en, hijri.month.ar);
            return `${hijri.day} ${monthName} ${hijri.year} H`;
        } else {
            throw new Error(`API error: ${data.code}`);
        }
    }
    
    normalizeHijriMonth(englishName, arabicName) {
        let monthName = this.monthMapping[englishName];
        if (!monthName) {
            monthName = this.monthMapping[arabicName];
        }
        if (!monthName) {
            const normalizedKey = this.normalizeMonthKey(englishName);
            monthName = this.normalizedMapping[normalizedKey];
        }
        if (!monthName) {
            console.warn('Bulan tidak ditemukan dalam mapping:', {english: englishName, arabic: arabicName});
            monthName = englishName;
        }
        return monthName;
    }
    
    getFallbackHijriDate() {
        const now = new Date();
        const hijriMonths = ['Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jumadilawal', 
                                'Jumadilakhir', 'Rajab', 'Syakban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah'];
        const hijriYear = 1446 + Math.floor((now.getFullYear() - 2024) * 0.97);
        const hijriMonth = hijriMonths[now.getMonth()];
        const hijriDay = now.getDate();
        
        return `${hijriDay} ${hijriMonth} ${hijriYear} H`;
    }
}

class MTQDataManager {
    constructor() {
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxliBxuewWrayG6EY2Z6VjthGhTabKUlgqXpa_VPUHo5dlZGiPGRGHKnuqEkFh-dgt5/exec';
        this.tabDataAbortController = null;
        this.currentTab = 'pendaftaran';
        this.isAutoRefreshEnabled = true;
        this.refreshInterval = 60;
        this.refreshIntervalId = null;
        this.countdownIntervalId = null;
        this.hijriDateSystem = new HijriDateSystem();
        this.statsManager = new StatsManager(this.WEB_APP_URL);
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.pesertaDataCache = null;
        this.searchTerm = '';
        this.kejuaraanDataCache = null;
        this.selectedLomba = 'Semua';
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
        this.startClockAndCountdown();
    }

    setupTabs() {
        const tabsContainer = document.getElementById('tabs');
        if (!tabsContainer) return;
        
        const tabs = [
            { id: 'pendaftaran', name: 'Pendaftaran', icon: 'fas fa-user-plus' },
            { id: 'peserta', name: 'Daftar Peserta', icon: 'fas fa-users' },
            { id: 'pemantauan', name: 'Pemantauan', icon: 'fas fa-eye' },
            { id: 'kejuaraan', name: 'Kejuaraan', icon: 'fas fa-trophy' },
            { id: 'klasemen', name: 'Klasemen', icon: 'fas fa-chart-bar' }
        ];
        
        tabs.forEach(tab => {
            const button = document.createElement('button');
            button.innerHTML = `<i class="${tab.icon}"></i> ${tab.name}`;
            button.setAttribute('data-tab', tab.id);
            button.addEventListener('click', () => this.switchTab(tab.id));
            tabsContainer.appendChild(button);
        });
        
        this.switchTab(this.currentTab);
    }

    setupEventListeners() {
        const manualRefresh = document.getElementById('manual-refresh');
        const toggleRefresh = document.getElementById('toggle-auto-refresh');
        const refreshInterval = document.getElementById('refresh-interval');
        
        if (manualRefresh) manualRefresh.addEventListener('click', () => this.refreshData());
        if (toggleRefresh) toggleRefresh.addEventListener('click', () => this.toggleAutoRefresh());
        if (refreshInterval) refreshInterval.addEventListener('change', (e) => {
            this.refreshInterval = parseInt(e.target.value);
            if (this.isAutoRefreshEnabled) {
                this.startAutoRefresh();
            }
            this.updateRefreshDisplay();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'hidden') {
                this.stopAutoRefresh();
                console.log('Tab is hidden, auto-refresh paused.');
            } else {
                this.startAutoRefresh();
                console.log('Tab is visible, auto-refresh resumed.');
            }
        });
    }

    async switchTab(tabId) {
        this.currentTab = tabId;
        this.currentPage = 1;
        this.searchTerm = '';
        this.selectedLomba = 'Semua';

        document.querySelectorAll('#tabs button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        await this.loadTabData(tabId);
        this.updateRefreshControls();
    }
    
    async loadInitialData() {
        await this.loadTabData(this.currentTab);
        await this.loadStats();
    }

    async loadTabData(tabId) {
        if (this.tabDataAbortController) {
            this.tabDataAbortController.abort();
        }
        this.tabDataAbortController = new AbortController();

        const container = document.getElementById('data-container');
        if (!container) return;
        
        try {
            container.innerHTML = `<div class="data-loading"><div class="spinner"></div><p>Memuat data terbaru...</p></div>`;
            
            if (tabId === 'pendaftaran') {
                container.innerHTML = `<iframe src="${FORM_URL}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0">Memuat formulir pendaftaran...</iframe>`;
                return;
            }

            const data = await this.fetchSheetData(tabId, this.tabDataAbortController.signal);
            
            if (data) {
                if (tabId === 'peserta') this.pesertaDataCache = data;
                if (tabId === 'kejuaraan') this.kejuaraanDataCache = data;
                this.renderData(tabId, data);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Permintaan data sebelumnya dibatalkan.');
                return;
            }
            console.error(`Error loading ${tabId} data:`, error);
            this.showError(`Gagal memuat data ${tabId}: ${error.message}`);
        }
    }
    
    async fetchSheetData(tabId, signal) {
        const url = `${this.WEB_APP_URL}?request=${tabId}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    }

    renderData(tabId, data) {
        const container = document.getElementById('data-container');
        if (!container || !data || !data.headers) {
            container.innerHTML = `<div class="data-loading"><p>Data tidak tersedia.</p></div>`;
            return;
        }
        
        let html = `
            <h3 style="color: var(--dark-text); margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getTabIcon(tabId)}"></i> ${this.getTabTitle(tabId)}
            </h3>`;

        if (tabId === 'peserta') {
            html += this.renderPesertaTab(data);
        } else if (tabId === 'kejuaraan') {
            html += this.renderKejuaraanTab(data);
        } else {
            html += this.renderGenericTab(data);
        }

        html += `<div class="last-updated"><i class="fas fa-clock"></i> Terakhir diperbarui: ${new Date().toLocaleString('id-ID')}</div>`;
        container.innerHTML = html;
        
        this.setupTabEventListeners(tabId);
    }
    
    renderPesertaTab(data) {
        let filteredRows = data.rows;
        if (this.searchTerm.trim() !== '') {
            const lowercasedTerm = this.searchTerm.toLowerCase();
            filteredRows = data.rows.filter(row => 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(lowercasedTerm)
                )
            );
        }
        
        const totalPages = Math.ceil(filteredRows.length / this.rowsPerPage);
        if (this.currentPage > totalPages) this.currentPage = 1;
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const paginatedRows = filteredRows.slice(startIndex, startIndex + this.rowsPerPage);
        
        let tableBodyHtml = '';
        if (paginatedRows.length > 0) {
            tableBodyHtml = paginatedRows.map(row => 
                `<tr>${data.headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}</tr>`
            ).join('');
        } else {
            tableBodyHtml = `<tr><td colspan="${data.headers.length}" style="text-align: center; padding: 20px;">
                ${this.searchTerm ? `Tidak ada hasil ditemukan untuk "${this.searchTerm}"` : 'Belum ada data peserta'}
            </td></tr>`;
        }
        
        return `
            <div class="search-container">
                <i class="fas fa-search"></i>
                <input type="text" id="search-input" placeholder="Cari berdasarkan nama, sekolah, kapanewon..." value="${this.searchTerm}">
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>${data.headers.map(header => `<th>${header}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableBodyHtml}</tbody>
                </table>
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" id="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Sebelumnya
                </button>
                <span class="pagination-info">Halaman ${this.currentPage} dari ${totalPages > 0 ? totalPages : 1}</span>
                <button class="pagination-btn" id="next-page" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
                    Berikutnya <i class="fas fa-chevron-right"></i>
                </button>
            </div>`;
    }
    
    renderKejuaraanTab(data) {
        const lombaOptions = [
            'Semua', 
            "Musabaqah Tilawatil Qur'an (MTQ)", 
            "Musabaqah Tartil Qur'an (MTtQ)", 
            "Musabaqah Hifdzil Qur'an (MHQ)", 
            "Musabaqah Azan (Maz)", 
            "Musabaqah Puitisasi Saritilawah", 
            "Lomba Pidato PAI (LPP)", 
            "Lomba Cerdas Cermat PAI (LCP)", 
            "Lomba Melukis Islami"
        ];
        
        let filteredRows = data.rows;
        if (this.selectedLomba !== 'Semua') {
            filteredRows = data.rows.filter(row => row['Cabang Lomba'] === this.selectedLomba);
        }
        
        let tableBodyHtml = '';
        if (filteredRows.length > 0) {
            tableBodyHtml = filteredRows.map(row => 
                `<tr>${data.headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}</tr>`
            ).join('');
        } else {
            tableBodyHtml = `<tr><td colspan="${data.headers.length}" style="text-align: center; padding: 20px;">
                ${this.selectedLomba !== 'Semua' ? `Belum ada data kejuaraan untuk ${this.selectedLomba}` : 'Belum ada data kejuaraan'}
            </td></tr>`;
        }
        
        return `
            <div class="filter-container">
                <label for="championship-filter">Filter Lomba:</label>
                <select id="championship-filter">
                    ${lombaOptions.map(lomba => 
                        `<option value="${lomba}" ${this.selectedLomba === lomba ? 'selected' : ''}>${lomba}</option>`
                    ).join('')}
                </select>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>${data.headers.map(header => `<th>${header}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableBodyHtml}</tbody>
                </table>
            </div>`;
    }
    
    renderGenericTab(data) {
        if (data.rows.length === 0) {
            return `<div class="data-loading"><p>Belum ada data untuk ditampilkan</p></div>`;
        } else {
            const centerColumns = [];
            data.headers.forEach((header, index) => {
                if (this.currentTab === 'pemantauan') {
                    if (!header.includes('Cabang Lomba')) {
                        centerColumns.push(index);
                    }
                } else if (this.currentTab === 'klasemen') {
                    if (!header.includes('Kapanewon')) {
                        centerColumns.push(index);
                    }
                }
            });

            return `
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>${data.headers.map((header, index) => 
                                `<th class="${centerColumns.includes(index) ? 'center-align' : 'left-align'}">${header}</th>`
                            ).join('')}</tr>
                        </thead>
                        <tbody>
                            ${data.rows.map(row => 
                                `<tr>${data.headers.map((header, index) => 
                                    `<td class="${centerColumns.includes(index) ? 'center-align' : 'left-align'}">${row[header] || '-'}</td>`
                                ).join('')}</tr>`
                            ).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
    }
    
    setupTabEventListeners(tabId) {
        if (tabId === 'peserta') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = this.searchTerm;
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.currentPage = 1;
                    this.renderData('peserta', this.pesertaDataCache);
                });
                
                if (document.activeElement.id !== 'search-input' && this.searchTerm.length > 0) {
                    searchInput.focus();
                    const endOfText = searchInput.value.length;
                    searchInput.setSelectionRange(endOfText, endOfText);
                }
            }
            
            document.getElementById('prev-page')?.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderData(tabId, this.pesertaDataCache);
                }
            });
            
            document.getElementById('next-page')?.addEventListener('click', () => {
                const filteredRows = this.pesertaDataCache.rows.filter(row => 
                    Object.values(row).some(value => 
                        String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
                    )
                );
                const totalPages = Math.ceil(filteredRows.length / this.rowsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderData(tabId, this.pesertaDataCache);
                }
            });
        }

        if (tabId === 'kejuaraan') {
            const filterDropdown = document.getElementById('championship-filter');
            filterDropdown?.addEventListener('change', (e) => {
                this.selectedLomba = e.target.value;
                this.renderData('kejuaraan', this.kejuaraanDataCache);
            });
        }
    }
    
    async refreshData() {
        if (this.currentTab !== 'pendaftaran') {
            if (this.currentTab === 'peserta') {
                this.pesertaDataCache = null;
            }
            if (this.currentTab === 'kejuaraan') {
                this.kejuaraanDataCache = null;
            }
            await this.loadTabData(this.currentTab);
            await this.loadStats();
            this.showRefreshNotification();
        }
    }
    
    getTabIcon(tabId) {
        const icons = {
            pendaftaran: 'user-plus',
            peserta: 'users',
            pemantauan: 'eye',
            kejuaraan: 'trophy',
            klasemen: 'chart-bar'
        };
        return icons[tabId] || 'table';
    }
    
    getTabTitle(tabId) {
        const titles = {
            pendaftaran: 'Formulir Pendaftaran',
            peserta: 'Daftar Peserta',
            pemantauan: 'Real-time Pemantauan',
            kejuaraan: 'Hasil Kejuaraan',
            klasemen: 'Klasemen Kapanewon'
        };
        return titles[tabId] || 'Data';
    }
    
    async loadStats() {
        try {
            await this.statsManager.calculateAllStats();
            this.renderStats();
        } catch (error) {
            console.error('Error loading stats:', error);
            this.renderStats();
        }
    }
    
    renderStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;
        
        statsGrid.innerHTML = this.statsManager.getStatsForDisplay()
            .map(stat => `
                <div class="stat-card">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-number">${stat.value}</div>
                    <i class="${stat.icon}" style="color: ${stat.color}; font-size: 1.5rem;"></i>
                </div>
            `).join('');
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh();
        if (this.isAutoRefreshEnabled && this.currentTab !== 'pendaftaran') {
            this.refreshIntervalId = setInterval(() => this.refreshData(), 1000 * this.refreshInterval);
        }
        this.updateRefreshDisplay();
    }
    
    stopAutoRefresh() {
        if (this.refreshIntervalId) {
            clearInterval(this.refreshIntervalId);
            this.refreshIntervalId = null;
        }
    }
    
    toggleAutoRefresh() {
        this.isAutoRefreshEnabled = !this.isAutoRefreshEnabled;
        if (this.isAutoRefreshEnabled) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        this.updateRefreshDisplay();
    }
    
    updateRefreshDisplay() {
        const statusElement = document.getElementById('refresh-display-status');
        const toggleButton = document.getElementById('toggle-auto-refresh');
        
        if (!statusElement || !toggleButton) return;
        
        if (this.currentTab === 'pendaftaran') {
            statusElement.textContent = 'Auto Refresh: Tidak Tersedia';
            toggleButton.innerHTML = '<i class="fas fa-power-off"></i> Matikan Auto Refresh';
            toggleButton.disabled = true;
            return;
        }
        
        toggleButton.disabled = false;
        
        if (this.isAutoRefreshEnabled) {
            statusElement.textContent = `Auto Refresh: ON (${this.refreshInterval} detik)`;
            toggleButton.innerHTML = '<i class="fas fa-power-off"></i> Matikan Auto Refresh';
        } else {
            statusElement.textContent = 'Auto Refresh: OFF';
            toggleButton.innerHTML = '<i class="fas fa-power-on"></i> Nyalakan Auto Refresh';
        }
    }
    
    updateRefreshControls() {
        this.updateRefreshDisplay();
    }
    
    showRefreshNotification() {
        const notification = document.createElement('div');
        notification.className = 'refresh-notification';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> Data diperbarui - ${new Date().toLocaleTimeString('id-ID')}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    showError(message) {
        const container = document.getElementById('data-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="data-error">
                <i class="fas fa-exclamation-triangle"></i>
                <div style="margin-bottom: 10px;"><strong>Gagal memuat data</strong></div>
                <div style="margin-bottom: 15px; font-size: 0.9rem;">${message}</div>
                <button onclick="mtqDataManager.refreshData()" class="refresh-btn">
                    <i class="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        `;
    }
    
    startClockAndCountdown() {
        setInterval(() => this.updateClock(), 1000);
        this.updateClock();
        this.startCountdown();
    }
    
    async updateClock() {
        let masehiDate = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
        }).replace(/Minggu/g, 'Ahad');
        
        const masehiElement = document.getElementById('masehi-date');
        const clockElement = document.getElementById('clock');
        const hijriElement = document.getElementById('hijri-date');
        
        if (masehiElement) masehiElement.textContent = masehiDate;
        
        const time = new Date().toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, ':');
        
        if (clockElement) clockElement.textContent = time;
        if (hijriElement) hijriElement.textContent = await this.hijriDateSystem.getHijriDate();
    }
    
    startCountdown() {
        const targetDate = new Date(TARGET_DATE_STRING).getTime();
        
        if (isNaN(targetDate)) {
            const countdownContainer = document.querySelector('.countdown-container');
            if (countdownContainer) {
                countdownContainer.innerHTML = '<h2 style="color: var(--light-gold);">Tanggal acara tidak valid!</h2>';
            }
            const countdownTitle = document.querySelector('.countdown-title');
            if (countdownTitle) countdownTitle.style.display = 'none';
            return;
        }
        
        this.countdownIntervalId = setInterval(() => this.updateCountdown(targetDate), 1000);
        this.updateCountdown(targetDate);
    }
    
    updateCountdown(targetDate) {
        const now = Date.now();
        const timeLeft = targetDate - now;
        
        if (timeLeft < 0) {
            const countdownContainer = document.querySelector('.countdown-container');
            if (countdownContainer) {
                countdownContainer.innerHTML = '<h2 style="color: var(--light-gold);">🎉 Acara Sedang Berlangsung! Ikuti di SD IT Ar-Raihan, Bantul! 🎉</h2>';
            }
            const countdownTitle = document.querySelector('.countdown-title');
            if (countdownTitle) countdownTitle.style.display = 'none';
            
            if (this.countdownIntervalId) {
                clearInterval(this.countdownIntervalId);
            }
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (daysElement) daysElement.textContent = String(days).padStart(2, '0');
        if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
        if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
        if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
    }
}

// ===== FUNGSI ADMIN =====

const VALID_USERS = {
    'pewara': 'mtq2025',
    'juri': 'mtq2025',
    'admin': 'mtq2025'
};

function checkAuth() {
    // Hanya jalankan di halaman admin
    if (!window.location.pathname.includes('admin-dashboard.html')) {
        return;
    }
    
    const isLoggedIn = localStorage.getItem('mtq_admin_logged_in');
    const user = localStorage.getItem('mtq_admin_user');
    
    if (isLoggedIn !== 'true' || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Update user info
    if (document.getElementById('user-role')) {
        document.getElementById('user-role').textContent = user.charAt(0).toUpperCase() + user.slice(1);
    }
    if (document.getElementById('display-user')) {
        document.getElementById('display-user').textContent = user.charAt(0).toUpperCase() + user.slice(1);
    }
    
    const loginTime = localStorage.getItem('mtq_login_time');
    if (loginTime && document.getElementById('login-time')) {
        const loginDate = new Date(loginTime);
        document.getElementById('login-time').textContent = loginDate.toLocaleString('id-ID');
    }
}

function checkExistingLogin() {
    const isLoggedIn = localStorage.getItem('mtq_admin_logged_in');
    if (isLoggedIn === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'admin-dashboard.html';
    }
}

function logout() {
    localStorage.removeItem('mtq_admin_logged_in');
    localStorage.removeItem('mtq_admin_user');
    localStorage.removeItem('mtq_login_time');
    window.location.href = 'login.html';
}

function openAllInputSheets() {
    const inputSheets = [
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=1995802078',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=773675545',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=1871770951',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=1679419554',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=60621255',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=187208022',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=49600397'
    ];
    
    inputSheets.forEach(url => {
        window.open(url, '_blank');
    });
    
    alert('Membuka semua sheet input nilai...');
}

function openAllLCPSheets() {
    const lcpSheets = [
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=2137287797',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=973893297',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=6221438'
    ];
    
    lcpSheets.forEach(url => {
        window.open(url, '_blank');
    });
    
    alert('Membuka semua sheet LCP...');
}

function refreshSheets() {
    alert('Untuk memperbarui data, tutup dan buka kembali tab Google Sheets.');
}

// ===== FUNGSI PENCARIAN UNTUK KEDUA HALAMAN (NILAI & NOMOR URUT) =====

const API_URL = 'https://script.google.com/macros/s/AKfycbwJ-0hT5xFwWBvOwMvBIBJ_M-nsBpbqpm5ohXL4j_67SbGvtVVe5O7iUrVMTKOl0uMw/exec';
let currentParticipantData = null;

function setExample(participantId) {
    document.getElementById('participantId').value = participantId;
    searchParticipant();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchParticipant();
    }
}

function validateParticipantId(participantId) {
    const validPrefixes = ['MTQ-', 'MTTQ-', 'MHQ-', 'MAZ-', 'MPS-', 'LPP-', 'LCP-', 'LMI-'];
    const upperCaseId = participantId.toUpperCase();
    return validPrefixes.some(prefix => upperCaseId.startsWith(prefix));
}

async function searchParticipant() {
    const participantId = document.getElementById('participantId').value.trim();
    const searchBtn = document.getElementById('searchBtn');
    const loading = document.getElementById('loading');
    const resultSection = document.getElementById('resultSection');

    if (!participantId) {
        showError('Masukkan nomor peserta terlebih dahulu');
        return;
    }

    // Tentukan jenis halaman (nilai atau nomor urut)
    const isNilaiPage = window.location.pathname.includes('nilai.html') || 
                        window.location.pathname.includes('cek-nilai.html');
    const isNoUrutPage = window.location.pathname.includes('urut-tampil.html') || 
                         window.location.pathname.includes('cek-no-urut.html');

    let tempId = participantId.toUpperCase();

    if (!validateParticipantId(tempId)) {
        showError('Format nomor peserta tidak valid. Gunakan contoh: MTQ-1, LCP-1, dll.');
        return;
    }

    let normalizedId = tempId
        .replace('MTTQ-', 'MTtQ-')
        .replace('MAZ-', 'MAz-');
    
    // Tampilkan loading
    if (loading) loading.style.display = 'block';
    if (resultSection) resultSection.style.display = 'none';
    
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    }

    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(normalizedId)}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success) {
            currentParticipantData = data;
            
            // Tampilkan hasil berdasarkan jenis halaman
            if (isNilaiPage) {
                displayParticipantDataNilai(data);
            } else if (isNoUrutPage) {
                displayParticipantDataNoUrut(data);
            } else {
                // Default ke tampilan nilai
                displayParticipantDataNilai(data);
            }
        } else {
            showError(data.error || 'Peserta tidak ditemukan. Pastikan nomor peserta sudah benar.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Terjadi kesalahan. Periksa koneksi internet dan coba lagi.');
    } finally {
        if (loading) loading.style.display = 'none';
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Cari Data';
        }
    }
}

// ===== TAMPILAN UNTUK HALAMAN NILAI =====
function displayParticipantDataNilai(data) {
    const resultSection = document.getElementById('resultSection');
    let html = '';

    if (data.lomba.kode === 'LCP') {
        html = generateLCPLayout(data);
    } else {
        html = generateIndividualLayout(data);
    }

    html += `
        <div class="action-buttons">
            <button class="action-btn print" onclick="printResults()">
                <i class="fas fa-print"></i> Cetak Hasil
            </button>
            <button class="action-btn share" onclick="shareResults()">
                <i class="fas fa-share-alt"></i> Bagikan
            </button>
            <button class="action-btn new-search" onclick="newSearch()">
                <i class="fas fa-search"></i> Pencarian Baru
            </button>
        </div>
    `;

    resultSection.innerHTML = html;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== TAMPILAN UNTUK HALAMAN NOMOR URUT =====
function displayParticipantDataNoUrut(data) {
    const participant = data.participant;
    const lomba = data.lomba;
    const resultSection = document.getElementById('resultSection');
    
    // DETeksi LCP yang lebih komprehensif
    const cabangLomba = participant['Cabang Lomba'] || '';
    const lombaName = lomba.name || '';
    const lombaKode = lomba.kode || '';
    
    console.log("Debug LCP:", {
        cabangLomba,
        lombaName, 
        lombaKode,
        participant,
        lomba
    });
    
    const isLCP = cabangLomba.includes('LCP') || 
                  lombaName.includes('LCP') || 
                  lombaKode.includes('LCP') ||
                  cabangLomba.includes('Cerdas Cermat') ||
                  lombaName.includes('Cerdas Cermat');
    
    console.log("isLCP result:", isLCP);
    
    let html = `
        <div class="success-badge">
            <i class="fas fa-check-circle"></i> DATA DITEMUKAN
        </div>
            
        <div class="participant-details">
            <table class="data-table-simple">
                <tr>
                    <td class="data-label">Nomor Peserta</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant['No Peserta']}</td>
                </tr>
    `;
    
    // Tampilan khusus untuk LCP
    if (isLCP) {
        console.log("Menampilkan tampilan LCP");
        html += `
                <tr>
                    <td class="data-label">Kapanewon</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant.Kapanewon}</td>
                </tr>
                <tr>
                    <td class="data-label">Cabang Lomba</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant['Cabang Lomba']}</td>
                </tr>
        `;
    } 
    // Tampilan untuk peserta selain LCP
    else {
        console.log("Menampilkan tampilan non-LCP");
        html += `
                <tr>
                    <td class="data-label">Nama</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant.Nama || '-'}</td>
                </tr>
                <tr>
                    <td class="data-label">Jenis Kelamin</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant['Jenis Kelamin'] || '-'}</td>
                </tr>
                <tr>
                    <td class="data-label">Asal Sekolah</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant['Asal Sekolah']}</td>
                </tr>
                <tr>
                    <td class="data-label">Kapanewon</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant.Kapanewon}</td>
                </tr>
                <tr>
                    <td class="data-label">Cabang Lomba</td>
                    <td class="data-separator">:</td>
                    <td class="data-value">${participant['Cabang Lomba']}</td>
                </tr>
        `;
    }
    
    html += `
            </table>
        </div>
        
        <div class="action-buttons">
            <button class="action-btn new-search" onclick="newSearch()">
                <i class="fas fa-search"></i> Cari Data Lain
            </button>
        </div>
    `;

    // Tambahkan info anggota tim untuk LCP
    if (lomba.isTeam && data.teamMembers && data.teamMembers.length > 0) {
        const teamHtml = `
            <div class="team-section">
                <h4><i class="fas fa-users"></i> Anggota Tim</h4>
                <table class="team-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Anggota</th>
                            <th>Jenis Kelamin</th>
                            <th>Asal Sekolah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.teamMembers.map((member, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${member.Nama}</td>
                                <td>${member['Jenis Kelamin'] || '-'}</td>
                                <td>${member['Asal Sekolah']}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Sisipkan sebelum action-buttons
        html = html.replace('<div class="action-buttons">', teamHtml + '<div class="action-buttons">');
    }

    resultSection.innerHTML = html;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== FUNGSI BANTUAN UNTUK TAMPILAN NILAI =====
function generateLCPLayout(data) {
    const participant = data.participant;
    const scores = data.scores;
    const teamMembers = data.teamMembers || [];

    const nilaiPenyisihan = scores.find(s => s.aspek === 'Nilai Penyisihan');
    const rankingPenyisihan = scores.find(s => s.aspek === 'Ranking Penyisihan');
    const status = scores.find(s => s.aspek === 'Status');
    const isLolos = status && (status.statusText === 'LOLOS' || status.statusText === 'Lolos');
    
    const wajibTiming = scores.find(s => s.aspek === 'Babak Wajib Timing');
    const wajibLempar = scores.find(s => s.aspek === 'Babak Wajib Lempar');
    const rebutan = scores.find(s => s.aspek === 'Babak Rebutan');
    const nilaiFinal = scores.find(s => s.aspek === 'Nilai Final');
    const juara = scores.find(s => s.aspek === 'Juara');

    let html = `
        <div class="section">
            <h3 class="section-title"><i class="fas fa-users"></i> INFORMASI TIM</h3>
            <table class="info-table">
                <tbody>
                    <tr><td class="info-label-cell">No. Peserta</td><td class="info-value-cell">${participant['No Peserta']}</td></tr>
                    <tr><td class="info-label-cell">Kapanewon</td><td class="info-value-cell">${participant.Kapanewon}</td></tr>
                    <tr><td class="info-label-cell">Cabang Lomba</td><td class="info-value-cell">${data.lomba.nama}</td></tr>
                </tbody>
            </table>
        </div>
    `;

    if (teamMembers.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title"><i class="fas fa-user-friends"></i> ANGGOTA TIM</h3>
                <div class="table-responsive">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th style="width: 50px; text-align: center;">No</th>
                                <th style="text-align: left;">Nama</th>
                                <th style="text-align: left;">Jenis Kelamin</th>
                                <th style="text-align: left;">Asal Sekolah</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teamMembers.map((member, index) => `
                                <tr>
                                    <td style="text-align: center;">${index + 1}</td>
                                    <td class="criteria-col" style="text-align: left;">${member.Nama}</td>
                                    <td style="text-align: left;">${member['Jenis Kelamin']}</td>
                                    <td style="text-align: left;">${member['Asal Sekolah']}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    html += `
        <div class="section">
            <h3 class="section-title"><i class="fas fa-list-ol"></i> BABAK PENYISIHAN</h3>
            <div class="scores-list">
                <div class="score-item">
                    <span class="score-aspek">Nilai Penyisihan</span>
                    <span class="score-nilai">${nilaiPenyisihan ? nilaiPenyisihan.nilai : '-'}</span>
                </div>
                <div class="score-item">
                    <span class="score-aspek">Ranking Penyisihan</span>
                    <span class="score-nilai">${rankingPenyisihan ? rankingPenyisihan.nilai : '-'}</span>
                </div>
                <div class="score-item">
                    <span class="score-aspek">Status</span>
                    <span class="score-nilai ${isLolos ? 'highlight' : ''}">${status ? (status.statusText || 'TIDAK LOLOS') : 'TIDAK LOLOS'}</span>
                </div>
            </div>
        </div>
    `;

    if (isLolos) {
        html += `
            <div class="section">
                <div class="status-lolos">
                    <i class="fas fa-check-circle"></i> SELAMAT! Tim Anda LULUS ke Babak Final
                </div>
                
                <h3 class="section-title"><i class="fas fa-trophy"></i> BABAK FINAL</h3>
                <div class="scores-list">
                    ${wajibTiming ? `<div class="score-item"><span class="score-aspek">Babak Wajib Timing</span><span class="score-nilai">${wajibTiming.nilai}</span></div>` : ''}
                    ${wajibLempar ? `<div class="score-item"><span class="score-aspek">Babak Wajib Lempar</span><span class="score-nilai">${wajibLempar.nilai}</span></div>` : ''}
                    ${rebutan ? `<div class="score-item"><span class="score-aspek">Babak Rebutan</span><span class="score-nilai">${rebutan.nilai}</span></div>` : ''}
                    ${nilaiFinal ? `<div class="score-item"><span class="score-aspek">Nilai Final</span><span class="score-nilai highlight">${nilaiFinal.nilai}</span></div>` : ''}
                </div>
            </div>
        `;

        if (juara && juara.nilai > 0) {
            const rankingLabel = getRankingLabel(juara.nilai, data.lomba.nama);
            html += `<div class="section"><div class="juara-badge"><i class="fas fa-trophy"></i> ${rankingLabel}</div></div>`;
        }
    } else {
        html += `<div class="section"><div class="status-tidak-lolos"><i class="fas fa-info-circle"></i> Terima kasih atas partisipasinya. Tim Anda belum berhasil melanjutkan ke babak final.</div></div>`;
    }

    return html;
}

function generateIndividualLayout(data) {
    const participant = data.participant;
    const scores = data.scores;

    let html = `
        <div class="section">
            <h3 class="section-title"><i class="fas fa-user"></i> INFORMASI PESERTA</h3>
            <table class="info-table">
                <tbody>
                    <tr><td class="info-label-cell">No. Peserta</td><td class="info-value-cell">${participant['No Peserta']}</td></tr>
                    <tr><td class="info-label-cell">Nama</td><td class="info-value-cell">${participant.Nama}</td></tr>
                    <tr><td class="info-label-cell">Jenis Kelamin</td><td class="info-value-cell">${participant['Jenis Kelamin']}</td></tr>
                    <tr><td class="info-label-cell">Asal Sekolah</td><td class="info-value-cell">${participant['Asal Sekolah']}</td></tr>
                    <tr><td class="info-label-cell">Kapanewon</td><td class="info-value-cell">${participant.Kapanewon}</td></tr>
                    <tr><td class="info-label-cell">Cabang Lomba</td><td class="info-value-cell">${data.lomba.nama}</td></tr>
                </tbody>
            </table>
        </div>
    `;

    const juriScores = scores.filter(s => s.aspek.includes('Juri') && !s.aspek.includes('Jumlah'));
    const jumlahScores = scores.filter(s => s.aspek.includes('Jumlah'));
    const nilaiAkhir = scores.find(s => s.aspek === 'Nilai Akhir');
    const peringkat = scores.find(s => s.aspek === 'Peringkat');

    const criteriaMap = {};
    juriScores.forEach(score => {
        const match = score.aspek.match(/Juri (\d+) - (.+)/);
        if (match) {
            const [, juriNum, criteria] = match;
            if (!criteriaMap[criteria]) {
                criteriaMap[criteria] = { j1: '-', j2: '-', j3: '-' };
            }
            criteriaMap[criteria][`j${juriNum}`] = score.nilai;
        }
    });

    const criteriaList = Object.keys(criteriaMap);

    if (criteriaList.length > 0) {
        html += `
            <div class="section">
                <h3 class="section-title"><i class="fas fa-chart-bar"></i> DETAIL PENILAIAN</h3>
                <div class="table-responsive">
                    <table class="score-table">
                        <thead>
                            <tr>
                                <th>KRITERIA</th>
                                <th>JURI 1</th>
                                <th>JURI 2</th>
                                <th>JURI 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${criteriaList.map((criteria, index) => `
                                <tr>
                                    <td class="criteria-col">${String.fromCharCode(65 + index)}. ${criteria}</td>
                                    <td class="juri-col">${criteriaMap[criteria].j1}</td>
                                    <td class="juri-col">${criteriaMap[criteria].j2}</td>
                                    <td class="juri-col">${criteriaMap[criteria].j3}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td class="criteria-col"><strong>JUMLAH</strong></td>
                                <td class="juri-col"><strong>${jumlahScores[0]?.nilai || '-'}</strong></td>
                                <td class="juri-col"><strong>${jumlahScores[1]?.nilai || '-'}</strong></td>
                                <td class="juri-col"><strong>${jumlahScores[2]?.nilai || '-'}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="table-responsive">
                    <table class="score-table" style="margin-top: 20px; box-shadow: none;">
                        <tbody>
                            ${nilaiAkhir ? `<tr class="final-row">
                                <td class="criteria-col" style="width: 50%; text-align: center !important;"><strong>NILAI AKHIR</strong></td>
                                <td class="juri-col" style="width: 50%; text-align: center !important;"><strong>${nilaiAkhir.nilai}</strong></td>
                            </tr>` : ''}
                            ${peringkat ? `<tr class="final-row">
                                <td class="criteria-col" style="text-align: center !important;"><strong>HASIL</strong></td>
                                <td class="juri-col" style="text-align: center !important;"><strong>${getRankingLabel(peringkat.nilai, data.lomba.nama)}</strong></td>
                            </tr>` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    return html;
}

function getRankingLabel(ranking, lombaName) {
    if (!ranking || ranking === 0) return '-';
    
    switch(parseInt(ranking)) {
        case 1: return `JUARA I ${getMedalEmoji(1)}`;
        case 2: return `JUARA II ${getMedalEmoji(2)}`;
        case 3: return `JUARA III ${getMedalEmoji(3)}`;
        case 4: return 'JUARA HARAPAN I';
        case 5: return 'JUARA HARAPAN II';
        default: return `PERINGKAT ${ranking}`;
    }
}

function getMedalEmoji(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
}

function showError(message) {
    const resultSection = document.getElementById('resultSection');
    resultSection.innerHTML = `
        <div class="section">
            <div class="error">
                <strong><i class="fas fa-exclamation-triangle"></i> Error</strong>
                <p>${message}</p>
                <button onclick="newSearch()" style="margin-top: 10px; padding: 12px 20px; background: var(--accent-gold); color: var(--primary-green); border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-search"></i> Pencarian Baru
                </button>
            </div>
        </div>
    `;
    resultSection.style.display = 'block';
}

function printResults() {
    window.print();
}

function shareResults() {
    if (navigator.share && currentParticipantData) {
        navigator.share({
            title: `Hasil Nilai MTQ Bantul 2025 - ${currentParticipantData.participant['No Peserta']}`,
            text: `Lihat hasil nilai ${currentParticipantData.participant.Nama || 'peserta'} di MTQ Bantul 2025`,
            url: window.location.href
        });
    } else if (currentParticipantData) {
        navigator.clipboard.writeText(`${window.location.href}?id=${currentParticipantData.participant['No Peserta']}`);
        alert('Link hasil telah disalin ke clipboard!');
    }
}

function newSearch() {
    document.getElementById('participantId').value = '';
    document.getElementById('participantId').focus();
    document.getElementById('resultSection').style.display = 'none';
    currentParticipantData = null;
}

// ===== INISIALISASI TAMBAHAN =====

// Update tahun copyright
function updateCopyrightYear() {
    const year = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright');
    copyrightElements.forEach(element => {
        if (element.textContent.includes('2025')) {
            element.textContent = element.textContent.replace('2025', year);
        }
    });
}

// Panggil update copyright tahun
updateCopyrightYear();
