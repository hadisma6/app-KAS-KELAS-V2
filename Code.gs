/**
 * ==============================================================================
 * KASKELAS PWA - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * ==============================================================================
 * Deskripsi : Backend API resmi untuk PWA KasKelas (Google Sheets Connection)
 * Mendukung : FULL CRUD (Create, Read/Search, Update, Delete) & Laporan Export
 * Auth/CORS : Publik (Anyone) / JSON Response dengan CORS Header Handshake
 * ==============================================================================
 */

// --- 1. SETTING NAMA TAB SPREADSHEET ---
const SHEET_KAS = "Kas_Harian";
const SHEET_EXPENSE = "Pengeluaran_Kas";
const SHEET_STUDENTS = "Master_Siswa";
const SHEET_SETTINGS = "Settings";

/**
 * Main Web App Handler untuk HTTP POST Request (Create, Update, Delete, Sync)
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || contents.Action;
    const payload = contents.payload || contents.Rows || contents;

    let result = { success: false, message: "Action tidak dikenal" };

    switch (action) {
      case "INIT_SHEETS":
        result = initSheets();
        break;
      case "SYNC_ALL":
      case "PUSH_DATA":
        result = handleSyncAll(payload);
        break;
      case "SAVE_KAS":
      case "Edit": // Compatibility dengan AppSheet format
        result = handleSaveKas(payload);
        break;
      case "SAVE_EXPENSE":
      case "Add_Expense":
        result = handleSaveExpense(payload);
        break;
      case "DELETE_EXPENSE":
      case "Delete_Expense":
        result = handleDeleteExpense(payload);
        break;
      case "SAVE_STUDENT":
        result = handleSaveStudent(payload);
        break;
      case "DELETE_STUDENT":
        result = handleDeleteStudent(payload);
        break;
      case "SAVE_SETTINGS":
        result = handleSaveSettings(payload);
        break;
      default:
        result = { success: false, message: "Action '" + action + "' tidak valid." };
    }

    return createJsonResponse(result);

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Main Web App Handler untuk HTTP GET Request (Read, Search, Download Laporan)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "PULL_ALL";
    let result = { success: false };

    switch (action) {
      case "PULL_ALL":
      case "READ_ALL":
        result = handlePullAll();
        break;
      case "SEARCH":
        const query = e.parameter.q || "";
        const week = e.parameter.week || "";
        result = handleSearchData(query, week);
        break;
      case "GET_REPORT":
        result = handleGenerateReport(e.parameter.month, e.parameter.year);
        break;
      default:
        result = handlePullAll();
    }

    return createJsonResponse(result);

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
  }
}

// ==============================================================================
// --- 2. LOGIK CRUD & DATABASE GOOGLE SHEETS ---
// ==============================================================================

/**
 * Inisialisasi Tab Spreadsheet & Header jika belum ada
 */
function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tab Kas Harian
  let shKas = ss.getSheetByName(SHEET_KAS);
  if (!shKas) {
    shKas = ss.insertSheet(SHEET_KAS);
    shKas.appendRow(["ID_Kas", "Minggu_Ke", "Nama_Siswa", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Total", "Last_Updated"]);
    shKas.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#dbeafe");
  }

  // 2. Tab Pengeluaran Kas
  let shExp = ss.getSheetByName(SHEET_EXPENSE);
  if (!shExp) {
    shExp = ss.insertSheet(SHEET_EXPENSE);
    shExp.appendRow(["ID_Pengeluaran", "Tanggal", "Keterangan", "Nominal", "Last_Updated"]);
    shExp.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#fecdd3");
  }

  // 3. Tab Master Siswa
  let shSt = ss.getSheetByName(SHEET_STUDENTS);
  if (!shSt) {
    shSt = ss.insertSheet(SHEET_STUDENTS);
    shSt.appendRow(["ID_Siswa", "Nama_Siswa", "Status", "Last_Updated"]);
    shSt.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e9d5ff");
  }

  // 4. Tab Settings
  let shSet = ss.getSheetByName(SHEET_SETTINGS);
  if (!shSet) {
    shSet = ss.insertSheet(SHEET_SETTINGS);
    shSet.appendRow(["Key", "Value"]);
    shSet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#f3f4f6");
    shSet.appendRow(["schoolName", "SD NEGERI 1 MERDEKA"]);
    shSet.appendRow(["className", "KELAS 5A"]);
    shSet.appendRow(["weeklyTarget", "5000"]);
  }

  return { success: true, message: "Semua tab database berhasil diinisialisasi!" };
}

/**
 * PULL ALL (READ & FETCH DATA LENGKAP DARI SPREADSHEET KE PWA)
 */
function handlePullAll() {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Fetch Students
  const shSt = ss.getSheetByName(SHEET_STUDENTS);
  const stData = shSt.getDataRange().getValues();
  let students = [];
  for (let i = 1; i < stData.length; i++) {
    if (stData[i][1]) students.push(stData[i][1].toString());
  }

  // 2. Fetch Kas Records
  const shKas = ss.getSheetByName(SHEET_KAS);
  const kasData = shKas.getDataRange().getValues();
  let kasRecords = {}; // Format: { "2026-W31": { "Nama": { mon, tue, wed, thu, fri, synced: true } } }

  for (let i = 1; i < kasData.length; i++) {
    const row = kasData[i];
    const idKas = row[0];
    const week = row[1];
    const student = row[2];
    if (week && student) {
      if (!kasRecords[week]) kasRecords[week] = {};
      kasRecords[week][student] = {
        mon: Number(row[3]) || 0,
        tue: Number(row[4]) || 0,
        wed: Number(row[5]) || 0,
        thu: Number(row[6]) || 0,
        fri: Number(row[7]) || 0,
        synced: true
      };
    }
  }

  // 3. Fetch Expenses
  const shExp = ss.getSheetByName(SHEET_EXPENSE);
  const expData = shExp.getDataRange().getValues();
  let expenses = [];
  for (let i = 1; i < expData.length; i++) {
    const row = expData[i];
    if (row[0]) {
      let tglStr = row[1];
      if (row[1] instanceof Date) {
        tglStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      const note = row[2] ? row[2].toString() : "";
      const amount = Number(row[3]) || 0;
      const category = (row.length > 5 && row[5]) ? row[5].toString() : "Lain-lain";
      const type = (row.length > 6 && row[6]) ? row[6].toString() : (
        category.toLowerCase().includes("talangan") || note.toLowerCase().includes("talangan") ? "talangan" :
        category.toLowerCase().includes("pengembalian") || note.toLowerCase().includes("pengembalian") ? "reimburse" : "expense"
      );

      expenses.push({
        id: row[0].toString(),
        date: tglStr.toString(),
        note: note,
        amount: amount,
        category: category,
        type: type,
        synced: true
      });
    }
  }

  // 4. Fetch Settings
  const shSet = ss.getSheetByName(SHEET_SETTINGS);
  const setRange = shSet.getDataRange().getValues();
  let settings = {};
  for (let i = 1; i < setRange.length; i++) {
    if (setRange[i][0]) settings[setRange[i][0]] = setRange[i][1];
  }

  return {
    success: true,
    data: {
      students: students,
      kasRecords: kasRecords,
      expenses: expenses,
      settings: settings
    }
  };
}

/**
 * CREATE & UPDATE KAS HARIAN (UPSERT)
 */
function handleSaveKas(rows) {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shKas = ss.getSheetByName(SHEET_KAS);
  const data = shKas.getDataRange().getValues();
  
  // Map ID_Kas -> Row Index (1-based)
  let idRowMap = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) idRowMap[data[i][0].toString()] = i + 1;
  }

  const timestamp = new Date();

  rows.forEach(item => {
    const idKas = item.ID_Kas || `${item.Minggu_Ke}-${item.Nama_Siswa}`;
    const week = item.Minggu_Ke;
    const student = item.Nama_Siswa;
    const mon = Number(item.Senin) || 0;
    const tue = Number(item.Selasa) || 0;
    const wed = Number(item.Rabu) || 0;
    const thu = Number(item.Kamis) || 0;
    const fri = Number(item.Jumat) || 0;
    const total = Number(item.Total) || (mon + tue + wed + thu + fri);

    if (idRowMap[idKas]) {
      // UPDATE (Baris sudah ada)
      const rowIndex = idRowMap[idKas];
      shKas.getRange(rowIndex, 1, 1, 10).setValues([[
        idKas, week, student, mon, tue, wed, thu, fri, total, timestamp
      ]]);
    } else {
      // CREATE (Tambah baris baru)
      shKas.appendRow([idKas, week, student, mon, tue, wed, thu, fri, total, timestamp]);
      idRowMap[idKas] = shKas.getLastRow();
    }
  });

  return { success: true, count: rows.length, message: "Data Kas berhasil disimpan (Upsert)!" };
}

/**
 * CREATE & UPDATE PENGELUARAN (UPSERT)
 */
function handleSaveExpense(payload) {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shExp = ss.getSheetByName(SHEET_EXPENSE);
  const data = shExp.getDataRange().getValues();

  // Pastikan header kolom memiliki Kategori dan Tipe jika belum ada
  if (data.length > 0 && data[0].length < 7) {
    shExp.getRange(1, 6).setValue("Kategori").setFontWeight("bold");
    shExp.getRange(1, 7).setValue("Tipe").setFontWeight("bold");
  }

  const items = Array.isArray(payload) ? payload : [payload];
  
  let idRowMap = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) idRowMap[data[i][0].toString()] = i + 1;
  }

  const timestamp = new Date();

  items.forEach(exp => {
    const id = (exp.ID_Pengeluaran || exp.id || Date.now()).toString();
    const date = exp.Tanggal || exp.date;
    const note = exp.Keterangan || exp.note;
    const amount = Number(exp.Nominal || exp.amount) || 0;
    const category = exp.Kategori || exp.category || "Lain-lain";
    const type = exp.Tipe || exp.type || (
      category.toLowerCase().includes("talangan") || note.toLowerCase().includes("talangan") ? "talangan" :
      category.toLowerCase().includes("pengembalian") || note.toLowerCase().includes("pengembalian") ? "reimburse" : "expense"
    );

    if (idRowMap[id]) {
      // UPDATE
      const rowIndex = idRowMap[id];
      shExp.getRange(rowIndex, 1, 1, 7).setValues([[id, date, note, amount, timestamp, category, type]]);
    } else {
      // CREATE
      shExp.appendRow([id, date, note, amount, timestamp, category, type]);
      idRowMap[id] = shExp.getLastRow();
    }
  });

  return { success: true, message: "Pengeluaran & Talangan berhasil disimpan!" };
}

/**
 * DELETE PENGELUARAN
 */
function handleDeleteExpense(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shExp = ss.getSheetByName(SHEET_EXPENSE);
  if (!shExp) return { success: false, message: "Tab pengeluaran tidak ditemukan." };

  const targetId = (payload.id || payload.ID_Pengeluaran || payload).toString();
  const data = shExp.getDataRange().getValues();

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0].toString() === targetId) {
      shExp.deleteRow(i + 1);
      return { success: true, message: "Data pengeluaran berhasil dihapus dari Google Sheets!" };
    }
  }

  return { success: false, message: "ID Pengeluaran tidak ditemukan di Google Sheets." };
}

/**
 * SAVE MASTER SISWA
 */
function handleSaveStudent(payload) {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shSt = ss.getSheetByName(SHEET_STUDENTS);
  const data = shSt.getDataRange().getValues();

  const studentsList = Array.isArray(payload) ? payload : [payload];
  
  // Set existing names
  let existingNames = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1]) existingNames.add(data[i][1].toString().trim().toLowerCase());
  }

  studentsList.forEach(st => {
    const name = (typeof st === "string" ? st : st.Nama_Siswa || st.name).trim();
    if (name && !existingNames.has(name.toLowerCase())) {
      const id = "ST-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      shSt.appendRow([id, name, "AKTIF", new Date()]);
      existingNames.add(name.toLowerCase());
    }
  });

  return { success: true, message: "Master Siswa berhasil diperbarui!" };
}

/**
 * DELETE SISWA
 */
function handleDeleteStudent(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shSt = ss.getSheetByName(SHEET_STUDENTS);
  if (!shSt) return { success: false };

  const targetName = (payload.name || payload.Nama_Siswa || payload).toString().trim().toLowerCase();
  
  let deletedFromMaster = false;
  // Hapus dari Master Siswa
  const dataSt = shSt.getDataRange().getValues();
  for (let i = dataSt.length - 1; i >= 1; i--) {
    if (dataSt[i][1].toString().trim().toLowerCase() === targetName) {
      shSt.deleteRow(i + 1);
      deletedFromMaster = true;
      break;
    }
  }

  // Hapus dari Kas Harian (jika ada)
  const shKas = ss.getSheetByName(SHEET_KAS);
  if (shKas) {
    const dataKas = shKas.getDataRange().getValues();
    for (let i = dataKas.length - 1; i >= 1; i--) {
      if (dataKas[i][2] && dataKas[i][2].toString().trim().toLowerCase() === targetName) {
        shKas.deleteRow(i + 1);
      }
    }
  }

  if (deletedFromMaster) {
    return { success: true, message: "Siswa dan kas harian terkait berhasil dihapus dari database." };
  }
  return { success: false, message: "Nama Siswa tidak ditemukan di Master Siswa." };
}

/**
 * SYNC ALL IN ONE BATCH (SYNC TERPADU DARI PWA)
 */
function handleSyncAll(payload) {
  initSheets();
  let results = { kas: null, expenses: null, deletedExpenses: null, deletedStudents: null, students: null, settings: null };

  if (payload.kasRows && payload.kasRows.length > 0) {
    results.kas = handleSaveKas(payload.kasRows);
  }
  if (payload.expenseRows && payload.expenseRows.length > 0) {
    results.expenses = handleSaveExpense(payload.expenseRows);
  }
  if (payload.deletedExpenseIds && payload.deletedExpenseIds.length > 0) {
    payload.deletedExpenseIds.forEach(id => handleDeleteExpense({ id: id }));
  }
  // Hapus siswa yang dihapus di lokal dari backend
  if (payload.deletedStudentNames && payload.deletedStudentNames.length > 0) {
    payload.deletedStudentNames.forEach(name => handleDeleteStudent({ name: name }));
    results.deletedStudents = { success: true, count: payload.deletedStudentNames.length };
  }
  if (payload.students && payload.students.length > 0) {
    results.students = handleSaveStudent(payload.students);
  }
  if (payload.settings && Object.keys(payload.settings).length > 0) {
    results.settings = handleSaveSettings(payload.settings);
  }

  return {
    success: true,
    message: "Sinkronisasi lengkap terpadu (Batch Sync) Berhasil!",
    details: results
  };
}

/**
 * CARI DATA (SEARCH QUERY ACROSS STUDENTS, WEEKS, EXPENSES)
 */
function handleSearchData(query, weekFilter) {
  const pull = handlePullAll();
  if (!pull.success) return pull;

  const q = query.toLowerCase().trim();
  const allData = pull.data;

  let filteredStudents = allData.students.filter(s => s.toLowerCase().includes(q));
  let filteredExpenses = allData.expenses.filter(e => e.note.toLowerCase().includes(q) || e.date.includes(q));

  let filteredKas = {};
  Object.keys(allData.kasRecords).forEach(w => {
    if (!weekFilter || w === weekFilter) {
      Object.keys(allData.kasRecords[w]).forEach(st => {
        if (!q || st.toLowerCase().includes(q) || w.toLowerCase().includes(q)) {
          if (!filteredKas[w]) filteredKas[w] = {};
          filteredKas[w][st] = allData.kasRecords[w][st];
        }
      });
    }
  });

  return {
    success: true,
    query: query,
    data: {
      students: filteredStudents,
      expenses: filteredExpenses,
      kasRecords: filteredKas
    }
  };
}

/**
 * SAVE SETTINGS
 */
function handleSaveSettings(payload) {
  initSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shSet = ss.getSheetByName(SHEET_SETTINGS);
  
  if (!payload || Object.keys(payload).length === 0) return { success: false, message: "Payload kosong." };

  // Baca data yang ada untuk mencari baris kunci
  const data = shSet.getDataRange().getValues();
  let keyRowMap = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) keyRowMap[data[i][0].toString()] = i + 1;
  }

  Object.keys(payload).forEach(key => {
    if (keyRowMap[key]) {
      // Update
      shSet.getRange(keyRowMap[key], 2).setValue(payload[key]);
    } else {
      // Create
      shSet.appendRow([key, payload[key]]);
      keyRowMap[key] = shSet.getLastRow();
    }
  });

  return { success: true, message: "Pengaturan berhasil disimpan ke Google Sheets!" };
}

/**
 * PROSES REKAPITULASI & DOWNLOAD LAPORAN
 */
function handleGenerateReport(month, year) {
  const pull = handlePullAll();
  if (!pull.success) return pull;

  const data = pull.data;
  let totalPemasukan = 0;
  let studentTotals = {};

  data.students.forEach(st => { studentTotals[st] = 0; });

  Object.keys(data.kasRecords).forEach(week => {
    Object.keys(data.kasRecords[week]).forEach(st => {
      const s = data.kasRecords[week][st];
      if (s) {
        const tot = (s.mon||0) + (s.tue||0) + (s.wed||0) + (s.thu||0) + (s.fri||0);
        totalPemasukan += tot;
        studentTotals[st] = (studentTotals[st] || 0) + tot;
      }
    });
  });

  let totalPengeluaran = data.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return {
    success: true,
    report: {
      totalPemasukan: totalPemasukan,
      totalPengeluaran: totalPengeluaran,
      saldoSisa: totalPemasukan - totalPengeluaran,
      studentTotals: studentTotals,
      expenses: data.expenses,
      generatedAt: new Date().toISOString()
    }
  };
}

// ==============================================================================
// --- 3. UTILS & CORS RESPONSE BUILDER ---
// ==============================================================================

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
