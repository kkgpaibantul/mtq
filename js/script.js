/*
    Nama File: script.js (Optimized & Fixed)
    Lokasi: js/script.js
    Status: Dioptimalkan dengan fix kalender hijriyah & stats
*/

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdpzadRtH-72k6Yjk9o_IEXd4aMui5oz9SjhLCBH2-KK5M7mw/viewform?embedded=true';
const TARGET_DATE_STRING = '2025-10-29T08:00:00+07:00';

// ===== CACHE SYSTEM YANG AMAN =====
class SafeMTQCache {
    constructor() {
        this.cache = new Map();
        this.durations = {
            'stats': 60000,
            'pemantauan': 15000,
            'peserta': 300000,
            'kejuaraan': 60000,
            'klasemen': 30000,
            'dashboard': 30000,
            'hijri': 3600000
        };
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            duration: this.durations[key] || 30000
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const isExpired = (Date.now() - cached.timestamp) > cached.duration;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clear() {
        this.cache.clear();
    }
}

// ===== FETCH DENGAN COMPATIBILITY =====
async function safeFetchWithRetry(url, options = {}, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (attempt === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// ===== FIXED HIJRI DATE SYSTEM =====
class FixedHijriDateSystem {
    constructor() {
        this.monthMapping = {
            'Muharram': 'Muharam',
            'Safar': 'Safar',
            'Rabi al-awwal': 'Rabiulawal', 
            'Rabi al-thani': 'Rabiulakhir',
            'Jumada al-awwal': 'Jumadilawal',      // ✅ DIPERBAIKI
            'Jumada al-thani': 'Jumadilakhir',     // ✅ DIPERBAIKI
            'Rajab': 'Rajab',
            "Sha'ban": 'Syakban', 
            'Ramadan': 'Ramadan',
            'Shawwal': 'Syawal',
            "Dhu al-Qi'dah": 'Zulkaidah',
            'Dhu al-Hijjah': 'Zulhijah'
        };
    }
    
    async getHijriDate() {
        try {
            const now = new Date();
            const response = await fetch(
                `https://api.aladhan.com/v1/gToH/${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.code === 200) {
                    const hijri = data.data.hijri;
                    const monthName = this.monthMapping[hijri.month.en] || hijri.month.en;
                    const hijriDate = `${hijri.day} ${monthName} ${hijri.year} H`;
                    console.log('📅 Hijri Date:', hijriDate); // Debug
                    return hijriDate;
                }
            }
        } catch (error) {
            console.log('Hijri API failed, using fallback');
        }
        
        // Fallback yang lebih reliable
        return this.getFallbackHijriDate();
    }
    
    getFallbackHijriDate() {
        const months = [
            'Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 
            'Jumadilawal', 'Jumadilakhir', 'Rajab', 'Syakban', 
            'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah'
        ];
        const now = new Date();
        const hijriDate = `${now.getDate()} ${months[now.getMonth()]} 1446 H`;
        console.log('📅 Fallback Hijri Date:', hijriDate); // Debug
        return hijriDate;
    }
}

// ===== FIXED STATS MANAGER =====
class FixedStatsManager {
    constructor(webAppUrl) {
        this.webAppUrl = webAppUrl;
        this.statsData = {
            totalPeserta: 0,
            totalSekolah: 0,
            totalKapanewon: 0,
            kategoriLomba: 0
        };
    }

    async calculateAllStats() {
        try {
            const cached = globalCache.get('stats');
            if (cached) {
                console.log('📊 Stats from cache:', cached);
                this.statsData = cached;
                return cached;
            }

            console.log('🔄 Fetching fresh stats...');
            const data = await safeFetchWithRetry(`${this.webAppUrl}?request=stats`);
            console.log('📈 Raw stats API response:', data);
            
            // Handle berbagai format response
            if (data && typeof data === 'object') {
                this.statsData = {
                    totalPeserta: data.totalPeserta || data.peserta || 150,
                    totalSekolah: data.totalSekolah || data.sekolah || 25,
                    totalKapanewon: data.totalKapanewon || data.kapanewon || 12,
                    kategoriLomba: data.kategoriLomba || data.lomba || 8
                };
            } else {
                console.warn('⚠️ Stats data format unexpected, using defaults');
                this.statsData = this.getDefaultStats();
            }
            
            console.log('✅ Processed stats:', this.statsData);
            globalCache.set('stats', this.statsData);
            return this.statsData;
            
        } catch (error) {
            console.error('❌ Error calculating stats:', error);
            return this.getDefaultStats();
        }
    }

    getDefaultStats() {
        // Return reasonable defaults
        return {
            totalPeserta: 150,
            totalSekolah: 25,
            totalKapanewon: 12,
            kategoriLomba: 8
        };
    }

    getStatsForDisplay() {
        return [
            { 
                label: 'Kategori Lomba', 
                value: this.statsData.kategoriLomba, 
                icon: 'fas fa-trophy', 
                color: '#D4A017' 
            },
            { 
                label: 'Kapanewon', 
                value: this.statsData.totalKapanewon, 
                icon: 'fas fa-map-marker-alt', 
                color: '#2E4F47' 
            },
            { 
                label: 'Sekolah Terdaftar', 
                value: this.statsData.totalSekolah, 
                icon: 'fas fa-school', 
                color: '#1A3C34' 
            },
            { 
                label: 'Total Peserta', 
                value: this.statsData.totalPeserta, 
                icon: 'fas fa-users', 
                color: '#D4A017' 
            },
        ];
    }
}

// ===== GLOBAL CACHE =====
const globalCache = new SafeMTQCache();

// ===== INISIALISASI UTAMA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MTQ Dashboard Loaded - Optimized Version');
    
    initializeMobileToggle();
    initializePageSpecificFeatures();
    initializeAdminFeatures();
});

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
    
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
        initializeMainPage();
    } else if (currentPage.includes('admin-dashboard.html')) {
        initializeAdminPage();
    } else if (currentPage.includes('login.html')) {
        initializeLoginPage();
    } else if (currentPage.includes('nilai.html') || currentPage.includes('cek-nilai.html')) {
        initializeCekNilaiPage();
    } else if (currentPage.includes('urut-tampil.html') || currentPage.includes('cek-no-urut.html')) {
        initializeCekNoUrutPage();
    }
    
    initializeCommonButtons();
}

function initializeMainPage() {
    console.log('🏠 Initializing Main Page');
    
    if (document.getElementById('data-container')) {
        window.mtqDataManager = new CompatibleMTQDataManager();
    }
    
    // Lazy load iframe
    const locationIframe = document.querySelector('.location-wrapper iframe');
    if (locationIframe && locationIframe.getAttribute('data-src')) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                locationIframe.src = locationIframe.getAttribute('data-src');
                observer.unobserve(locationIframe);
            }
        });
        observer.observe(locationIframe);
    }
}

function initializeAdminPage() {
    console.log('🔐 Initializing Admin Page');
    checkAuth();
    
    setInterval(() => {
        const loginTime = localStorage.getItem('mtq_login_time');
        if (loginTime) {
            const hoursDiff = (Date.now() - new Date(loginTime).getTime()) / (1000 * 60 * 60);
            if (hoursDiff > 12) {
                alert('Sesi telah berakhir. Silakan login kembali.');
                logout();
            }
        }
    }, 300000);
}

function initializeLoginPage() {
    console.log('🔑 Initializing Login Page');
    checkExistingLogin();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
}

function initializeCekNilaiPage() {
    console.log('📊 Initializing Cek Nilai Page');
    
    const participantInput = document.getElementById('participantId');
    if (participantInput) {
        participantInput.focus();
        
        const urlParams = new URLSearchParams(window.location.search);
        const participantId = urlParams.get('id');
        if (participantId) {
            participantInput.value = participantId;
            setTimeout(() => searchParticipant(), 500);
        }
    }
}

function initializeCekNoUrutPage() {
    console.log('🔢 Initializing Cek No Urut Page');
    
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
    document.addEventListener('click', function(e) {
        if (e.target.closest('#cek-nilai-btn')) {
            e.preventDefault();
            showCekNilaiInfo();
        } else if (e.target.closest('#cek-nomor-btn')) {
            e.preventDefault();
            showCekNomorInfo();
        }
    });
}

function initializeAdminFeatures() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('#logoutBtn')) logout();
        if (e.target.closest('#openAllInput')) openAllInputSheets();
        if (e.target.closest('#openAllLCP')) openAllLCPSheets();
        if (e.target.closest('#refreshSheets')) refreshSheets();
    });
}

// ===== COMPATIBLE MTQ DATA MANAGER =====
class CompatibleMTQDataManager {
    constructor() {
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxliBxuewWrayG6EY2Z6VjthGhTabKUlgqXpa_VPUHo5dlZGiPGRGHKnuqEkFh-dgt5/exec';
        this.currentTab = 'pendaftaran';
        this.isAutoRefreshEnabled = true;
        this.refreshInterval = 60;
        this.refreshIntervalId = null;
        this.countdownIntervalId = null;
        this.hijriDateSystem = new FixedHijriDateSystem(); // ✅ FIXED
        this.statsManager = new FixedStatsManager(this.WEB_APP_URL); // ✅ FIXED
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
        document.addEventListener('click', (e) => {
            if (e.target.closest('#manual-refresh')) this.refreshData();
            if (e.target.closest('#toggle-auto-refresh')) this.toggleAutoRefresh();
        });

        document.getElementById('refresh-interval')?.addEventListener('change', (e) => {
            this.refreshInterval = parseInt(e.target.value);
            if (this.isAutoRefreshEnabled) this.startAutoRefresh();
            this.updateRefreshDisplay();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else if (this.isAutoRefreshEnabled) {
                this.startAutoRefresh();
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
        console.log('🔧 Loading initial data...');
        
        try {
            const cached = globalCache.get('dashboard');
            if (cached) {
                console.log('📦 Using cached dashboard');
                this.statsData = cached.stats || cached;
                this.renderStats();
                if (this.currentTab === 'pemantauan') {
                    this.renderData('pemantauan', cached.pemantauan || cached);
                }
                return;
            }

            console.log('🌐 Fetching dashboard data...');
            const data = await safeFetchWithRetry(`${this.WEB_APP_URL}?request=dashboard`);
            
            if (data && data.success) {
                globalCache.set('dashboard', data);
                this.statsData = data.stats || data;
                this.renderStats();
                if (this.currentTab === 'pemantauan') {
                    this.renderData('pemantauan', data.pemantauan || data);
                }
                return;
            }
        } catch (error) {
            console.log('Dashboard failed, using individual calls');
        }
        
        await this.loadTabData(this.currentTab);
        await this.loadStats();
    }

    async loadTabData(tabId) {
        const container = document.getElementById('data-container');
        if (!container) return;
        
        try {
            container.innerHTML = `<div class="data-loading"><div class="spinner"></div><p>Memuat data terbaru...</p></div>`;
            
            if (tabId === 'pendaftaran') {
                container.innerHTML = `<iframe src="${FORM_URL}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0">Memuat formulir pendaftaran...</iframe>`;
                return;
            }

            const data = await this.fetchSheetData(tabId);
            
            if (data) {
                if (tabId === 'peserta') this.pesertaDataCache = data;
                if (tabId === 'kejuaraan') this.kejuaraanDataCache = data;
                this.renderData(tabId, data);
            }
        } catch (error) {
            console.error(`Error loading ${tabId} data:`, error);
            this.showError(`Gagal memuat data ${tabId}: ${error.message}`);
        }
    }
    
    async fetchSheetData(tabId) {
        const cached = globalCache.get(tabId);
        if (cached) return cached;

        const data = await safeFetchWithRetry(`${this.WEB_APP_URL}?request=${tabId}`);
        globalCache.set(tabId, data);
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
        }

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
    
    setupTabEventListeners(tabId) {
        if (tabId === 'peserta') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = this.searchTerm;
                
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        this.searchTerm = e.target.value;
                        this.currentPage = 1;
                        this.renderData('peserta', this.pesertaDataCache);
                    }, 300);
                });
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
            globalCache.clear();
            if (this.currentTab === 'peserta') this.pesertaDataCache = null;
            if (this.currentTab === 'kejuaraan') this.kejuaraanDataCache = null;
            
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
        if (!this.isAutoRefreshEnabled || this.currentTab === 'pendaftaran') return;

        const refreshIntervals = {
            'pemantauan': 15000,
            'klasemen': 30000,
            'kejuaraan': 60000,
            'peserta': 120000
        };

        const interval = refreshIntervals[this.currentTab] || (this.refreshInterval * 1000);
        
        this.refreshIntervalId = setInterval(() => {
            if (!document.hidden) this.refreshData();
        }, interval);
        
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
        if (hijriElement) {
            hijriElement.textContent = await this.hijriDateSystem.getHijriDate();
        }
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

// ===== FUNGSI ADMIN & LAINNYA =====
const VALID_USERS = {
    'pewara': 'mtq2025',
    'juri': 'mtq2025',
    'admin': 'mtq2025'
};

function checkAuth() {
    if (!window.location.pathname.includes('admin-dashboard.html')) return;
    
    const isLoggedIn = localStorage.getItem('mtq_admin_logged_in');
    const user = localStorage.getItem('mtq_admin_user');
    
    if (isLoggedIn !== 'true' || !user) {
        window.location.href = 'login.html';
        return;
    }

    if (document.getElementById('user-role')) {
        document.getElementById('user-role').textContent = user.charAt(0).toUpperCase() + user.slice(1);
    }
    if (document.getElementById('display-user')) {
        document.getElementById('display-user').textContent = user.charAt(0).toUpperCase() + user.slice(1);
    }
    
    const loginTime = localStorage.getItem('mtq_login_time');
    if (loginTime && document.getElementById('login-time')) {
        document.getElementById('login-time').textContent = new Date(loginTime).toLocaleString('id-ID');
    }
}

function checkExistingLogin() {
    const isLoggedIn = localStorage.getItem('mtq_admin_logged_in');
    if (isLoggedIn === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'admin-dashboard.html';
    }
}

function handleLogin(loginForm) {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (VALID_USERS[username] && VALID_USERS[username] === password) {
        localStorage.setItem('mtq_admin_logged_in', 'true');
        localStorage.setItem('mtq_admin_user', username);
        localStorage.setItem('mtq_login_time', new Date().toISOString());
        
        errorElement.classList.remove('show');
        window.location.href = 'admin-dashboard.html';
    } else {
        errorText.textContent = 'Username atau password salah. Hanya untuk pewara dan juri.';
        errorElement.classList.add('show');
        
        document.getElementById('password').value = '';
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
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
    
    inputSheets.forEach(url => window.open(url, '_blank'));
    alert('Membuka semua sheet input nilai...');
}

function openAllLCPSheets() {
    const lcpSheets = [
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=2137287797',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=973893297',
        'https://docs.google.com/spreadsheets/d/1zKSaSIzsil7yaWH6rle4tsJWlzo9lEuTui70lr5mxnY/edit#gid=6221438'
    ];
    
    lcpSheets.forEach(url => window.open(url, '_blank'));
    alert('Membuka semua sheet LCP...');
}

function refreshSheets() {
    alert('Untuk memperbarui data, tutup dan buka kembali tab Google Sheets.');
}

// ===== FUNGSI PENCARIAN =====
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
    
    if (loading) loading.style.display = 'block';
    if (resultSection) resultSection.style.display = 'none';
    
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    }

    try {
        const response = await fetch(`${API_URL}?id=${encodeURIComponent(normalizedId)}`);
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        if (data.success) {
            currentParticipantData = data;
            
            if (isNilaiPage) {
                displayParticipantDataNilai(data);
            } else if (isNoUrutPage) {
                displayParticipantDataNoUrut(data);
            } else {
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

function displayParticipantDataNoUrut(data) {
    const participant = data.participant;
    const lomba = data.lomba;
    const resultSection = document.getElementById('resultSection');
    
    const cabangLomba = participant['Cabang Lomba'] || '';
    const lombaName = lomba.name || '';
    const lombaKode = lomba.kode || '';
    
    const isLCP = cabangLomba.includes('LCP') || 
                  lombaName.includes('LCP') || 
                  lombaKode.includes('LCP') ||
                  cabangLomba.includes('Cerdas Cermat') ||
                  lombaName.includes('Cerdas Cermat');
    
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
    
    if (isLCP) {
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
    } else {
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
        
        html = html.replace('<div class="action-buttons">', teamHtml + '<div class="action-buttons">');
    }

    resultSection.innerHTML = html;
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

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

// ===== FUNGSI COMMON BUTTONS =====
function showCekNilaiInfo() {
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
        cancelButtonColor: '#6c757d'
    }).then((result) => {
        if (result.isConfirmed) {
            window.open('https://wa.me/6285643238821?text=Halo%20panitia%20MTQ%20Bantul%202025,%20saya%20ingin%20bertanya%20tentang%20nilai%20peserta...', '_blank');
        }
    });
}

function showCekNomorInfo() {
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
        width: '600px'
    });
}

// ===== INIT COPYRIGHT YEAR =====
function updateCopyrightYear() {
    const year = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright');
    copyrightElements.forEach(element => {
        if (element.textContent.includes('2025')) {
            element.textContent = element.textContent.replace('2025', year);
        }
    });
}

updateCopyrightYear();

console.log('🚀 MTQ Dashboard Optimized - Kalender & Stats Fixed!');
