/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
   return knex.schema.createTable('vfd_dated_counters', function(table) {
    table.increments('id').unsigned().primary();
    table.bigInteger('dc').notNullable();
    table.string('dc_date').notNullable();
    table.bigInteger('zreport_status').notNullable();
    table.bigInteger('zreport_processed_on').notNullable();
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
  return knex.schema.dropTableIfExists('vfd_dated_counters');
};
