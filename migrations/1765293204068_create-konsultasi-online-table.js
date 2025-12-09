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
  pgm.createTable("konsultasi_online", {
    id_konsultasi_online: {
      type: "bigserial",
      primaryKey: true,
    },
    id_mahasiswa: {
      type: "bigint",
      references: "mahasiswa",
      referencesColumn: "id_mahasiswa",
      onDelete: "CASCADE",
    },
    id_psikolog: {
      type: "bigint",
      references: "psikolog",
      referencesColumn: "id_psikolog",
      onDelete: "CASCADE",
    },
    id_jadwal: {
      type: "bigint",
      references: "jadwal_online",
      referencesColumn: "id_jadwal",
      onDelete: "CASCADE",
    },
    keluhan: { type: "text" },
    status: { type: "bigint" },
    tanggal_pengajuan: { type: "timestamptz" },
    url_join_zoom: { type: "text" },
    url_start_zoom: { type: "text" },
    alasan_penolakan: { type: "text" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("konsultasi_online");
};
