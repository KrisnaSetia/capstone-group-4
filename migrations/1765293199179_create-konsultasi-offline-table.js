/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("konsultasi_offline", {
    id_konsultasi: {
      type: "bigserial",
      primaryKey: true,
    },
    id_user: {
      type: "bigint",
      references: "users",
      referencesColumn: "id_user",
      onDelete: "CASCADE",
    },
    id_jadwal: {
      type: "bigint",
      references: "jadwal_offline",
      referencesColumn: "id_jadwal",
      onDelete: "CASCADE",
    },
    keluhan: { type: "text" },
    tanggal_pengajuan: { type: "timestamptz" },
    status: { type: "bigint" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("konsultasi_offline");
};
