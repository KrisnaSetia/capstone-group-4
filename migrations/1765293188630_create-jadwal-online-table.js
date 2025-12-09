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
  pgm.createTable("jadwal_online", {
    id_jadwal: {
      type: "bigserial",
      primaryKey: true,
    },
    id_psikolog: {
      type: "bigint",
      references: "psikolog",
      referencesColumn: "id_psikolog",
      onDelete: "CASCADE",
    },
    tanggal: { type: "timestamptz" },
    sesi: { type: "bigint" },
    status: { type: "text" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("jadwal_online");
};
