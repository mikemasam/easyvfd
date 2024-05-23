/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.createTable('receipt_items', function(table) {
    table.increments('id').unsigned().notNullable().primary();
    table.bigInteger('receipt_id').defaultTo(0);
    table.string('item_ref', 255).nullable();
    table.string('desc', 255).nullable();
    table.integer('tax_code_pos').notNullable();
    table.decimal('qty', 13, 2).defaultTo(0.00);
    table.decimal('amount_excl', 13, 2).defaultTo(0.00);
    table.decimal('amount_incl', 13, 2).defaultTo(0.00);
    table.decimal('amount_tax', 13, 2).defaultTo(0.00);
    table.decimal('vat_rate', 13, 2).defaultTo(0.00);
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipt_items');
};
