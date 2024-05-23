/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.createTable('receipt_payments', function(table) {
    table.increments('id').unsigned().notNullable().primary();
    table.bigInteger('receipt_id').defaultTo(0);
    table.string('pmt_ref', 255).nullable();
    table.string('pmt_type', 255).nullable();
    table.decimal('amount', 13, 2).defaultTo(0.00);
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipt_payments');
};
