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
  pgm.createTable("rating_psikolog", {
    id_rating: {
      type: "bigserial",
      primaryKey: true,
    },
    id_psikolog: {
      type: "bigint",
      references: "psikolog",
      referencesColumn: "id_psikolog",
      onDelete: "CASCADE",
    },
    id_user: {
      type: "bigint",
      references: "users",
      referencesColumn: "id_user",
      onDelete: "CASCADE",
    },
    rating: { type: "bigint" },
    waktu_rating: { type: "timestamptz" },
    id_riwayat: {
      type: "bigint",
      references: "riwayat",
      referencesColumn: "id_riwayat",
      onDelete: "CASCADE",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("rating_psikolog");
};
