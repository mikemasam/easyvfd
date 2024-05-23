/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('receipts', function(table) {
    table.increments('id').unsigned().primary();
    table.dateTime('issued_date').nullable();
    table.string('bill_reference').nullable();
    table.string('bill_receipt').nullable();
    table.string('customer_id').nullable();
    table.string('customer_id_type').nullable();
    table.string('customer_name').nullable();
    table.string('customer_mobile_number').nullable();
    table.integer('client_id');
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipts');
};
