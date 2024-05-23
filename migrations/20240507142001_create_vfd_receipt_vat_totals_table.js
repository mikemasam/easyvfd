/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('vfd_receipt_vat_totals', function(table) {
    table.increments('id').unsigned().primary();
    table.decimal('amount_net', 13, 2).notNullable();
    table.decimal('amount_tax', 13, 2).notNullable();
    table.string('tax_code_char').notNullable();
    table.bigInteger('vfd_receipt_id').nullable().defaultTo(null);
    table.integer('client_id').nullable().defaultTo(null);
    table.timestamps();
    // Foreign key constraint examples (uncomment and customize as needed)
    // table.foreign('vfd_receipt_id').references('id').inTable('vfd_receipts');
    // table.foreign('client_id').references('id').inTable('clients');
  }); 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vfd_receipt_vat_totals');
};
