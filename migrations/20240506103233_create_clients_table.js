exports.up = function(knex) {
  return knex.schema.createTable('clients', function(table) {
    table.increments('id').unsigned().primary();
    table.string('vendor_serial_number', 255).nullable();
    table.text('privatekey64').nullable();
    table.string('certificate_serial_number', 500).nullable();
    table.string('reg_id', 255).nullable();
    table.string('uin', 255).nullable();
    table.string('tin', 255).notNullable();
    table.string('vrn', 255).nullable();
    table.string('mobile', 255).nullable();
    table.string('address', 255).nullable();
    table.string('street', 255).nullable();
    table.string('city', 255).nullable();
    table.string('region', 255).nullable();
    table.string('country', 255).nullable();
    table.string('name', 255).nullable();
    table.string('receipt_code', 255).nullable();
    table.string('routing_key', 255).nullable();
    table.string('routing_zkey', 255).nullable();
    table.integer('gc').defaultTo(0);
    table.string('tax_office', 255).nullable();
    table.string('username', 255).nullable();
    table.string('password', 255).nullable();
    table.string('token_path', 255).nullable();
    table.boolean('registered').defaultTo(false);
    table.bigInteger('registered_on').defaultTo(0);
    table.integer('status').defaultTo(0);
    table.text('token_value').nullable();
    table.integer('token_expiry').defaultTo(0);
    table.integer('vat_registered').notNullable().defaultTo(1);
    table.string('taxcodes', 500).nullable();
    table.timestamps();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('clients');
};
