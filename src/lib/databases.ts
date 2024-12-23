import PostgresDatabaseAdapter from "@ai16z/adapter-postgres";
import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqlite";
import { CacheManager, DbCacheAdapter, IDatabaseCacheAdapter } from "@ai16z/eliza";
import Database from "better-sqlite3";

import { Character } from "@ai16z/eliza";
import path from "path";

function initializeDatabase(dataDir: string) {

  if (process.env.PRISM_ENV === 'production') {
    return new PostgresDatabaseAdapter({
      connectionString: process.env.POSTGRES_URL,
    });
  }

  const filePath = process.env.SQLITE_FILE ?? path.resolve(dataDir, "db.sqlite");
  return new SqliteDatabaseAdapter(new Database(filePath));
}

function intializeDbCache(character: Character, db: IDatabaseCacheAdapter) {
  return new CacheManager(new DbCacheAdapter(db, character.id));
} 

export { initializeDatabase, intializeDbCache };
