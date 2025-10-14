import { deleteDatabaseAsync, openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DATABASE_NAME = "diotrix-gallery.db";
const TABLE_NAME = "generated_images";

let databaseInstance: SQLiteDatabase | null = null;
let initializing: Promise<SQLiteDatabase> | null = null;

type ImageRow = {
  id: number;
  uri: string;
  prompt: string;
  metadata: string | null;
  created_at: string;
};

export interface ImageMetadata {
  aspectRatio?: string;
  guidanceScale?: number;
  stylePreset?: string;
  model?: string;
  extras?: Record<string, unknown>;
}

export interface ImageRecord {
  id: number;
  uri: string;
  prompt: string;
  metadata: ImageMetadata | null;
  createdAt: string;
}

export interface CreateImageRecordInput {
  uri: string;
  prompt: string;
  metadata?: ImageMetadata | null;
}

export interface UpdateImageRecordInput {
  uri?: string;
  prompt?: string;
  metadata?: ImageMetadata | null;
}

const ensureDatabase = async (): Promise<SQLiteDatabase> => {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (!initializing) {
    initializing = (async () => {
      const db = await openDatabaseAsync(DATABASE_NAME);
      await db.execAsync("PRAGMA journal_mode = WAL;");
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uri TEXT NOT NULL,
          prompt TEXT NOT NULL,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      return db;
    })();
  }

  databaseInstance = await initializing;
  initializing = null;
  return databaseInstance;
};

const parseMetadata = (value: string | null): ImageMetadata | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ImageMetadata;
    return parsed ?? null;
  } catch (error) {
    console.warn("[database] Failed to parse image metadata", error);
    return null;
  }
};

const serializeMetadata = (metadata?: ImageMetadata | null): string | null => {
  if (!metadata) {
    return null;
  }

  try {
    return JSON.stringify(metadata);
  } catch (error) {
    console.warn("[database] Failed to serialize image metadata", error);
    return null;
  }
};

const mapRowToRecord = (row: ImageRow): ImageRecord => ({
  id: row.id,
  uri: row.uri,
  prompt: row.prompt,
  metadata: parseMetadata(row.metadata),
  createdAt: row.created_at,
});

const getImageRowById = async (db: SQLiteDatabase, id: number): Promise<ImageRow | null> => {
  const row = await db.getFirstAsync<ImageRow>(
    `SELECT id, uri, prompt, metadata, created_at FROM ${TABLE_NAME} WHERE id = ?;`,
    [id]
  );
  return row ?? null;
};

export const createImageRecord = async (input: CreateImageRecordInput): Promise<ImageRecord> => {
  const db = await ensureDatabase();
  const serializedMetadata = serializeMetadata(input.metadata ?? null);

  const result = await db.runAsync(
    `INSERT INTO ${TABLE_NAME} (uri, prompt, metadata) VALUES (?, ?, ?);`,
    [input.uri, input.prompt, serializedMetadata]
  );

  return getImageRecordById(result.lastInsertRowId);
};

export const getImageRecordById = async (id: number): Promise<ImageRecord> => {
  const db = await ensureDatabase();
  const row = await getImageRowById(db, id);

  if (!row) {
    throw new Error(`Image record with id ${id} not found.`);
  }

  return mapRowToRecord(row);
};

export const listImageRecords = async (): Promise<ImageRecord[]> => {
  const db = await ensureDatabase();
  const rows = await db.getAllAsync<ImageRow>(
    `SELECT id, uri, prompt, metadata, created_at FROM ${TABLE_NAME} ORDER BY datetime(created_at) DESC;`
  );

  return rows.map(mapRowToRecord);
};

export const updateImageRecord = async (
  id: number,
  updates: UpdateImageRecordInput
): Promise<ImageRecord> => {
  const db = await ensureDatabase();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.uri !== undefined) {
    fields.push("uri = ?");
    values.push(updates.uri);
  }

  if (updates.prompt !== undefined) {
    fields.push("prompt = ?");
    values.push(updates.prompt);
  }

  if (updates.metadata !== undefined) {
    fields.push("metadata = ?");
    values.push(serializeMetadata(updates.metadata));
  }

  if (fields.length === 0) {
    return getImageRecordById(id);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE ${TABLE_NAME} SET ${fields.join(", ")} WHERE id = ?;`,
    values
  );

  return getImageRecordById(id);
};

export const deleteImageRecord = async (id: number): Promise<ImageRecord | null> => {
  const db = await ensureDatabase();
  const row = await getImageRowById(db, id);

  if (!row) {
    return null;
  }

  await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE id = ?;`, [id]);
  return mapRowToRecord(row);
};

export const clearImageRecords = async (): Promise<void> => {
  const db = await ensureDatabase();
  await db.runAsync(`DELETE FROM ${TABLE_NAME};`, []);
};

export const resetImageDatabase = async (): Promise<void> => {
  if (databaseInstance) {
    try {
      await databaseInstance.closeAsync();
    } catch (error) {
      console.warn("[database] Failed to close database before reset", error);
    }
    databaseInstance = null;
  }

  if (initializing) {
    try {
      const pendingDb = await initializing;
      await pendingDb.closeAsync();
    } catch (error) {
      console.warn("[database] Failed to close initializing database before reset", error);
    } finally {
      initializing = null;
    }
  }

  await deleteDatabaseAsync(DATABASE_NAME);
};

