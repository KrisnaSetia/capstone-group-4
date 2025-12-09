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
  pgm.createTable("psikolog", {
    id_psikolog: {
      type: "bigint",
      primaryKey: true,
      references: "users",
      referencesColumn: "id_user",
      onDelete: "CASCADE",
    },
    nomor_sertifikasi: { type: "text" },
    kuota_harian: { type: "bigint" },
    rating: { type: "double precision" },
    deskripsi: { type: "text" },
    url_foto: { type: "text" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("psikolog");
};
