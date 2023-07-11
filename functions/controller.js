const pool = require("./db");
const queries = require("./queries");
const bcrypt = require("bcryptjs");

const getCusts = (req, res) => {
  pool.query(queries.queryCusts, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};
const getSales = (req, res) => {
  pool.query(queries.querySales, (error, results) => {
    if (error) throw error;
    res.status(200).json(results.rows);
  });
};
const getCustAllInfo = (req, res) => {
  // console.log(`getCustAllInfo,req.params = ${JSON.stringify(req.params)}`);
  // const id = parseInt(req.params.id);
  const id = parseInt(req.user.id);
  console.log(`getCustAllInfo,user.id = ${id}`);
  pool.query(queries.queryCustAllInfo, [id], (error, results) => {
    if (error) throw error;
    const customer = {
      firstName: results.rows[0].first_name,
      lastName: results.rows[0].last_name,
      address1: results.rows[0].address_1,
      address2: results.rows[0].address_2,
      city: results.rows[0].city,
      state: results.rows[0].st,
      zip: results.rows[0].zip,
      tel: results.rows[0].tel,
      userId: id,
      custId: results.rows[0].custid,
      isadmin: results.rows[0].isadmin,
    };
    console.log(
      `getCustAllInfo,customer id = ${JSON.stringify(customer.custId)}`
    );
    return res.status(200).json(customer);
  });
};
const getCustById = (req, res) => {
  // console.log(`getCustAllInfo,req.params = ${JSON.stringify(req.params)}`);
  const id = parseInt(req.params.id);
  console.log(`getCustById,id = ${id}`);
  pool.query(queries.queryCustById, [id], (error, results) => {
    if (error) throw error;
    const customer = {
      firstName: results.rows[0].first_name,
      lastName: results.rows[0].last_name,
      address1: results.rows[0].address_1,
      address2: results.rows[0].address_2,
      city: results.rows[0].city,
      state: results.rows[0].st,
      zip: results.rows[0].zip,
      tel: results.rows[0].tel,
      custId: results.rows[0].custId,
      isadmin: results.rows[0].isadmin,
    };
    return res.status(200).json(customer);
  });
};
const getSalesByCustId = (req, res) => {
  const paramId = parseInt(req.params.id);
  const userId = parseInt(req.user.id);
  console.log(
    `getSalesByCustId,params.id,user.id = ${paramId}, ${req.user.id}`
  );
  if (userId !== paramId) {
    console.log(`...userId(${userId}) paramId(${paramId}) don't match`);
    return res.sendStatus(401);
  }

  pool.query(queries.querySalesByCustId, [paramId], (error, results) => {
    if (error) throw error;
    const sales = [];
    results.rows.map((row) => {
      const sale = {
        saleDate: row.sale_date,
        amount: row.amount,
        tax: row.tax,
        taxStatus: row.tax_status,
        saleId: row.id,
      };
      // console.log(`sale = ${sale}`);
      sales.push(sale);
    });

    res.status(200).json(sales);
  });
};
const getSaleDetails = (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id)) {
    console.log(`getSaleDetails invalid`);
    return res.status(403).send(`getSaleDetails ${id} is invalid`);
  }
  const userId = parseInt(req.user.id);
  console.log(`getSaleDetails,id = ${id}`);
  pool.query(queries.querySaleDetails, [id, userId], (error, results) => {
    if (error) throw error;
    const items = [];
    results.rows.map((row, itm) => {
      const item = {
        item: itm,
        name: row.name,
        desc: row.desc,
        price: row.price,
        quantity: row.quantity,
      };
      // console.log(`item = ${JSON.stringify(item)}`);
      items.push(item);
    });

    res.status(200).json(items);
  });
};
const getAllItems = (req, res) => {
  console.log(`getAllItems`);
  pool.query(queries.queryAllItems, (error, results) => {
    if (error) throw error;
    const items = [];
    results.rows.map((row) => {
      const item = {
        prodName: row.name,
        desc: row.desc,
        price: row.price,
        itemId: row.id,
      };
      console.log(`item = ${JSON.stringify(item)}`);
      items.push(item);
    });

    res.status(200).json(items);
  });
};

const emailExists = (email) => {
  console.log(`Inside emailExists, email = ${email}`);
  const user = pool.query(queries.queryEmail, [email]);
  if (!user) return false;
  return user;
};

const getUserById = (id) => {
  console.log(`getUserById, id = ${parseInt(id)}`);
  const user = pool.query(queries.queryUserId, [parseInt(id)]);
  if (!user) return false;
  return user;
};

const createUser = async (
  email,
  password,
  address1,
  address2,
  city,
  zip,
  state,
  telephone,
  firstName,
  lastName
) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const data = await pool.query(queries.addCustomer, [
    email,
    hash,
    firstName,
    lastName,
    address1,
    address2,
    city,
    zip,
    state,
    telephone,
  ]);

  if (data.rowCount == 0) return false;
  return data.rows[0];
};

const createSale = async (
  saleDate,
  amount,
  tax,
  taxStatus,
  custId,
  saleItems
) => {
  let data = [];
  const saleData = await pool.query(queries.addSale, [
    saleDate,
    amount,
    tax,
    taxStatus,
    custId,
  ]);
  const saleId = saleData.rows[0].id;
  data.push(saleId);
  console.log(`inside createSale - saleId: ${JSON.stringify(saleId)}`);
  let items = [];
  for (let x in saleItems) {
    const { itemId, quantity } = saleItems[x];
    const saleItemData = await pool.query(queries.addSaleItems, [
      saleId,
      itemId,
      quantity,
    ]);
    const saleItemId = saleItemData.rows[0].items_id;
    console.log(`               - saleItemId:${JSON.stringify(saleItemId)}`);
    items.push(saleItemId);
  }
  data.push(items);
  if (data.rowCount == 0) return false;
  return data;
};

const matchPassword = async (password, hashPassword) => {
  const match = await bcrypt.compare(password, hashPassword);
  return match;
};

module.exports = {
  getCusts,
  getSales,
  getCustById,
  getAllItems,
  getCustAllInfo,
  getSaleDetails,
  getUserById,
  getSalesByCustId,
  emailExists,
  createUser,
  createSale,
  matchPassword,
};
