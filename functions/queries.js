const queryCusts = "SELECT * FROM customers limit 15";
const querySales = "SELECT * FROM sales limit 15";
const queryCustById =
  "SELECT first_name, last_name, address_1, address_2, city, st, zip, tel, customers.id as custid\
    FROM customers, address, cust_address, telephone, cust_telephone \
    WHERE customers.id = $1 \
	AND address.id = address_id \
	AND telephone.id = telephone_id \
    AND cust_telephone.customer_id = cust_address.customer_id \
    AND cust_telephone.customer_id = customers.id";
const queryCustAllInfo =
  "SELECT first_name, last_name, address_1, address_2, city, st, zip, tel, customers.id as custid, isadmin \
    FROM users,customers, address, cust_address, telephone, cust_telephone \
    WHERE users.id = $1 \
    AND customers.id = users.customer_id\
	AND address.id = address_id \
	AND telephone.id = telephone_id \
    AND cust_telephone.customer_id = cust_address.customer_id \
    AND cust_telephone.customer_id = customers.id";
const querySaleDetails =
  "SELECT items.name as name, items.description as desc, items.price as price, sales_items.quantity  as quantity \
    FROM users,sales, sales_items, items \
    WHERE sales.id = $1 \
    AND users.id = $2\
	AND sales.id = sales_items.sales_id \
	AND items.id = sales_items.items_id";
const queryAllItems =
  "SELECT items.name as name, items.description as desc, items.price as price, id  \
    FROM items ORDER BY id ASC";
const querySalesByCustId =
  "SELECT sale_date, amount, tax, tax_status, sales.id\
     FROM users,customers,sales\
     WHERE customers.id = users.customer_id\
     AND customers.id = sales.cust_id\
     AND users.id = $1";
const queryEmail =
  "SELECT id, email, isadmin, password FROM users WHERE email=$1";
const queryUserId = "SELECT id, email, customer_id FROM users WHERE id=$1";
const addUser =
  "INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id, email, password";
const addCustomer =
  "with \
   c_id AS(INSERT INTO customers(first_name, last_name) VALUES ($3, $4) RETURNING id),\
   a_id AS(INSERT INTO address(address_1, address_2, city, zip, st) VALUES ($5, $6, $7, $8, $9) RETURNING id),\
   cc_id AS(INSERT INTO cust_address(customer_id, address_id) VALUES ((SELECT id FROM c_id), (SELECT id FROM a_id)) RETURNING customer_id),\
   t_id AS(INSERT INTO telephone(tel) VALUES ($10) RETURNING id),\
   tc_id AS(INSERT INTO cust_telephone(customer_id, telephone_id) VALUES ((SELECT customer_id FROM cc_id), (SELECT id FROM t_id)) RETURNING customer_id),\
   ec_id AS(INSERT INTO emails(email, customer_id) VALUES ($1,(SELECT customer_id FROM tc_id)) RETURNING customer_id)\
  INSERT INTO users(email, password, customer_id) VALUES ($1, $2, (SELECT customer_id FROM ec_id)) RETURNING id, email, password";
const addSale =
  "INSERT INTO sales(sale_date, amount, tax, tax_status, cust_id) VALUES($1, $2, $3, $4, $5) RETURNING id";
const addSaleItems =
  "INSERT INTO sales_items(sales_id, items_id, quantity) VALUES ($1, $2, $3) RETURNING items_id";
const deleteUserCustomer =
  "WITH del AS (SELECT CAST($1 AS int)AS c_id),\
dels1 AS (DELETE FROM cust_address USING del WHERE customer_id = del.c_id RETURNING address_id, cust_address.id AS ca_id),\
     dels2 AS (DELETE FROM cust_telephone USING del WHERE customer_id = del.c_id RETURNING telephone_id, cust_telephone.id AS ct_id),\
     dels3 AS (DELETE FROM emails USING del WHERE customer_id = del.c_id RETURNING id AS e_id),\
     dels4 AS (DELETE FROM users USING del WHERE customer_id = del.c_id RETURNING id AS u_id),\
     dels5 AS (DELETE FROM address USING dels1 WHERE id = dels1.address_id RETURNING id AS a_id),\
     dels6 AS (DELETE FROM telephone USING dels2 WHERE id = dels2.telephone_id RETURNING id AS t_id),\
     dels7 AS (DELETE FROM customers USING del WHERE id = del.c_id  RETURNING *)\
SELECT * from dels1,dels2,dels3,dels4,dels5,dels6,dels7;";
const updateUserEmail = "UPDATE users SET email = $1 WHERE id = $2";

module.exports = {
  queryCusts,
  querySales,
  queryCustAllInfo,
  querySaleDetails,
  queryCustById,
  querySalesByCustId,
  queryAllItems,
  queryEmail,
  queryUserId,
  addUser,
  addCustomer,
  deleteUserCustomer,
  updateUserEmail,
  addSale,
  addSaleItems,
};
