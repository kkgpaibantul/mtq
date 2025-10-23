// --- KONFIGURASI UTAMA ---
const SHEET_ID = '1wUBVX98Jv3YlOZM4YElzH7cVSkRY2vMHmoMyD1aQ-j8'; // ID Spreadsheet Anda

// DIUBAH: Durasi cache standar untuk data yang tidak diprioritaskan
const STANDARD_CACHE_SECONDS = 30; 

// DIUBAH: Tambahkan properti 'cache' pada setiap tab untuk menentukan durasinya
const TAB_CONFIG = {
  'pemantauan': { sheet: 'Pemantauan', range: 'A:F', cache: 10 }, // Prioritas: 10 detik
  'kejuaraan': { sheet: 'Kejuaraan', range: 'A:F', cache: STANDARD_CACHE_SECONDS },
  'klasemen': { sheet: 'Klasemen', range: 'I:P', cache: STANDARD_CACHE_SECONDS },
  'peserta': { sheet: 'Peserta', range: 'A:E', cache: STANDARD_CACHE_SECONDS }
};

// Fungsi utama yang akan dipanggil oleh website Anda
function doGet(e) {
  const requestType = e.parameter.request;
  let data;

  switch (requestType) {
    case 'stats':
      data = getStatsData();
      break;
    case 'pemantauan':
    case 'kejuaraan':
    case 'klasemen':
    case 'peserta':
      data = getTabData(requestType);
      break;
    default:
      data = { error: 'Permintaan tidak valid' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(data))
                       .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi untuk mengambil data statistik (sudah termasuk cache)
function getStatsData() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'stats_data';
  
  let cached = cache.get(cacheKey);
  if (cached != null) {
    return JSON.parse(cached);
  }

  const pesertaData = getSheetData('Peserta', 'A:E');
  const pemantauanData = getSheetData('Pemantauan', 'A:F');
  const klasemenData = getSheetData('Klasemen', 'I:P');

  let stats = {
    totalPeserta: pesertaData.rows.length,
    totalSekolah: new Set(pesertaData.rows.map(r => r['Asal Sekolah'])).size,
    totalKapanewon: new Set(pesertaData.rows.map(r => r['Kapanewon'])).size,
    kategoriLomba: pemantauanData.rows.length,
  };
  
  // BARU: Gunakan durasi cache standar untuk data statistik
  cache.put(cacheKey, JSON.stringify(stats), STANDARD_CACHE_SECONDS);
  
  return stats;
}

// Fungsi untuk mengambil data per tab (sudah termasuk cache)
function getTabData(tabId) {
  const cache = CacheService.getScriptCache();
  const cacheKey = `tab_data_${tabId}`;

  let cached = cache.get(cacheKey);
  if (cached != null) {
    return JSON.parse(cached);
  }
  
  const config = TAB_CONFIG[tabId];
  if (!config) {
    return { error: 'Konfigurasi tab tidak ditemukan' };
  }
  
  const data = getSheetData(config.sheet, config.range);
  
  // DIUBAH: Ambil durasi cache dari konfigurasi, bukan angka statis
  cache.put(cacheKey, JSON.stringify(data), config.cache); 
  
  return data;
}

// Fungsi utilitas untuk membaca dan memproses data dari sheet
function getSheetData(sheetName, range) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(sheetName);
    const values = sheet.getRange(range).getDisplayValues();
    
    const nonEmptyValues = values.filter(row => row.join("").length > 0);

    if (nonEmptyValues.length < 2) {
      return { headers: nonEmptyValues[0] || [], rows: [] };
    }
    
    const headers = nonEmptyValues.shift();
    
    const rows = nonEmptyValues.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        if(header) {
            obj[header] = row[index] || '';
        }
      });
      return obj;
    });
    
    return { headers, rows };
  } catch (e) {
    return { headers: [], rows: [], error: e.message };
  }
}
