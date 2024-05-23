/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('vfd_receipt_items', function(table) {
    table.increments('id').unsigned().primary();
    table.bigInteger('item_id');
    table.string('item_ref').nullable();
    table.string('desc').notNullable();
    table.decimal('qty', 13, 2).notNullable();
    table.decimal('amount', 13, 2).notNullable();
    table.integer('tax_code_pos').notNullable();
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
  return knex.schema.dropTableIfExists('vfd_receipt_items');
};
