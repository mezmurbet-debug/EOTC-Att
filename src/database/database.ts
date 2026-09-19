import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync("eotc_attendance.db");

    await database.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        group_name TEXT,
        photo_uri TEXT,
        qr_code TEXT NOT NULL UNIQUE,
        registration_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_date TEXT NOT NULL,
        service_name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        member_id TEXT NOT NULL,
        member_name TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        method TEXT NOT NULL
      );
    `);
  }

  return database;
}
