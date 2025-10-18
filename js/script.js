/*
    Nama File: script.js
    Lokasi: js/script.js
*/

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdpzadRtH-72k6Yjk9o_IEXd4aMui5oz9SjhLCBH2-KK5M7mw/viewform?embedded=true';
const TARGET_DATE_STRING = '2025-10-29T08:00:00+07:00';

// Navbar Mobile Toggle - DARI KODE PERTAMA
document.getElementById('mobile-toggle').addEventListener('click', function() {
    document.getElementById('navbar-menu').classList.toggle('active');
});

// Fungsi untuk Cek Nilai dengan SweetAlert - TIDAK BERUBAH
document.getElementById('cek-nilai-btn').addEventListener('click', function(e) {
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

// FUNGSI CEK NOMOR URUT YANG DIPERBAIKI - TIDAK BERUBAH
document.getElementById('cek-nomor-btn').addEventListener('click', function(e) {
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

// SISA SCRIPT DIPINDAH KESINI
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
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxmywzrf7z9a8agbf-xw6OOYNS17ST609Ced3DFnXMUjH16DRqtoIqQbqH7WHRxOqyR/exec';
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
        document.getElementById('manual-refresh').addEventListener('click', () => this.refreshData());
        document.getElementById('toggle-auto-refresh').addEventListener('click', () => this.toggleAutoRefresh());
        document.getElementById('refresh-interval').addEventListener('change', (e) => {
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
        if (!data || !data.headers) {
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
            // Deteksi kolom yang perlu di-center berdasarkan tab
            const centerColumns = [];
            data.headers.forEach((header, index) => {
                if (this.currentTab === 'pemantauan') {
                    // Di pemantauan, hanya "Cabang Lomba" yang rata kiri, lainnya center
                    if (!header.includes('Cabang Lomba')) {
                        centerColumns.push(index);
                    }
                } else if (this.currentTab === 'klasemen') {
                    // Di klasemen, hanya "Kapanewon" yang rata kiri, lainnya center
                    if (!header.includes('Kapanewon')) {
                        centerColumns.push(index);
                    }
                }
                // Tab lainnya tetap default (rata kiri semua)
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
        document.getElementById('stats-grid').innerHTML = this.statsManager.getStatsForDisplay()
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
        document.getElementById('data-container').innerHTML = `
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
        
        document.getElementById('masehi-date').textContent = masehiDate;
        
        const time = new Date().toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\./g, ':');
        
        document.getElementById('clock').textContent = time;
        document.getElementById('hijri-date').textContent = await this.hijriDateSystem.getHijriDate();
    }
    
    startCountdown() {
        const targetDate = new Date(TARGET_DATE_STRING).getTime();
        
        if (isNaN(targetDate)) {
            document.querySelector('.countdown-container').innerHTML = '<h2 style="color: var(--light-gold);">Tanggal acara tidak valid!</h2>';
            document.querySelector('.countdown-title').style.display = 'none';
            return;
        }
        
        this.countdownIntervalId = setInterval(() => this.updateCountdown(targetDate), 1000);
        this.updateCountdown(targetDate);
    }
    
    updateCountdown(targetDate) {
        const now = Date.now();
        const timeLeft = targetDate - now;
        
        if (timeLeft < 0) {
            document.querySelector('.countdown-container').innerHTML = '<h2 style="color: var(--light-gold);">🎉 Acara Sedang Berlangsung! Ikuti di SD IT Ar-Raihan, Bantul! 🎉</h2>';
            document.querySelector('.countdown-title').style.display = 'none';
            clearInterval(this.countdownIntervalId);
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
}

let mtqDataManager;
document.addEventListener('DOMContentLoaded', function() {
    mtqDataManager = new MTQDataManager();
    
    // Lazy load iframe peta lokasi
    const locationIframe = document.querySelector('.location-wrapper iframe');
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            locationIframe.src = locationIframe.getAttribute('data-src');
            observer.unobserve(locationIframe);
        }
    });
    observer.observe(locationIframe);
});