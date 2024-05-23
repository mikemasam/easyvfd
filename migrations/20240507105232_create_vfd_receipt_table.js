/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
return knex.schema.createTable('vfd_receipts', function(table) {
    table.increments('id').unsigned().primary();
    table.string('rdate');
    table.string('rtime');
    table.string('tin');
    table.string('reg_id');
    table.string('efd_serial');
    table.string('cust_id_type');
    table.string('cust_id').nullable().defaultTo(null);
    table.string('cust_name').nullable().defaultTo(null);
    table.string('mobile_num').nullable().defaultTo(null);
    table.bigInteger('rctnum');
    table.bigInteger('dc');
    table.bigInteger('gc');
    table.string('znum');
    table.string('rctv_num');
    table.integer('status');
    table.bigInteger('processed_on');
    table.bigInteger('receipt_id');
    table.integer('client_id');
    table.bigInteger('dc_id');
    table.decimal('amount_tax_incl', 13, 2).defaultTo(0.00);
    table.decimal('amount_tax_excl', 13, 2).defaultTo(0.00);
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vfd_receipts');
};
