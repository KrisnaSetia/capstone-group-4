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
  pgm.createTable("riwayat", {
    id_riwayat: {
      type: "bigserial",
      primaryKey: true,
    },
    id_konsultasi_online: {
      type: "bigint",
      references: "konsultasi_online",
      referencesColumn: "id_konsultasi_online",
      onDelete: "CASCADE",
    },
    waktu_mulai: { type: "timestamptz" },
    waktu_selesai: { type: "timestamptz" },
    status_akhir: { type: "bigint" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("riwayat");
};
