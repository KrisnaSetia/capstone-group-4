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
  pgm.createTable("lagu_tenang", {
    id_lagu: {
      type: "bigserial",
      primaryKey: true,
    },
    judul_lagu: { type: "text" },
    artis: { type: "text" },
    durasi: { type: "bigint" },
    file_url: { type: "text" },
    url_foto: { type: "text" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("lagu_tenang");
};
