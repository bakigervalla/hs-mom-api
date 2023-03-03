const Order = require("../../models").Order;
const OrderDetail = require("../../models").OrderDetail;
const Page = require("../../models").Page;
const authUser = require("../../utils/helpers").authUser;
const CrtSubscription = require("../subscriptions/controller");

const db = require("../../models");

exports.getOrders = (req, res) => {
  const { client_id } = req.body;

  Order.findAll({
    where: {
      client_id: client_id,
    },
  })
    .then((orders) => {
      if (orders.length === 0) {
        return res.status(400).send("No Orders");
      }
      return res.json(orders);
    })
    .catch((err) => {
      console.log("Orders err!", err);
      return res.status(400).send({ error: err.message });
    });
};

exports.saveOrder = async (req, res) => {
  let newOrder = getOrderData(req);

  delete newOrder.order_id; // delete order_id from insert

  let subscription = await CrtSubscription.getSubscription(
    newOrder.subscription_id
  );

  if (subscription.status !== 200)
    return res.status(subscription.status).send({ error: subscription.error });

  var result = await this.insertOrder(newOrder, subscription.data.Apps);

  return result.status === 200
    ? res.status(result.status).send(result.data)
    : res.status(result.status).send({ error: result.error });
};

exports.insertOrder = async (newOrder, apps) => {
  return await Order.create(newOrder)
            .then((data) => {
              return { status: 200, data: data };
          })
          .catch((err) => {
            console.log(err.message);
              return { status: 400, error: "Faield to insert order" };
          });

      // // save order details
      // let newApps = apps.map((itm) => {
      //   return {
      //     order_id: data.order_id,
      //     app_id: itm.app_id,
      //     app_token: "",
      //   };
      // });

      // var result = await OrderDetail.bulkCreate(newApps)
      //   .then((response) => {
      //     return !response || response.length === 0
      //       ? { status: 400, error: "Failed to store order details." }
      //       : { status: 200, data: response };
      //   })
      //   .catch((err) => {
      //     return { status: 400, error: err.message };
      //   });

    //   return result;
    // })
    // .catch((err) => {
    //   return { status: 400, error: err.message };
    // });
};

exports.setActiveApp = (req, res) => {
  let user_id = getUserIdFromToken(req);
  let app_id = req.body.app_id;

  const sql = `UPDATE orders SET default_app_id = null WHERE user_id = ${user_id}; 
               UPDATE orders SET default_app_id = '${app_id}' WHERE user_id = ${user_id};`;

  return db.sequelize
    .query(sql, {
      type: db.Sequelize.QueryTypes.UPDATE,
    })
    .then((results) => {
      return res.json(results);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

// PAGES
exports.getAllPages = async (req, res) => {
  const user = authUser(req); 
  const sql = `select * from pages where user_id = ${user.user_id}`;
  
  const result = await db.sequelize.query(sql, {
    model: Page,
    mapToModel: false,
    type: db.Sequelize.QueryTypes.SELECT,
  });
  res.json(result);
};

exports.getPages = async (req, res) => {
  const user = authUser(req); 
  const sql = `select p.*
              from pages p
              inner join orders o on p.app_id = o.default_app_id and o.user_id = p.user_id
              where p.user_id = ${user.user_id}`;
  
  const result = await db.sequelize.query(sql, {
    model: Page,
    mapToModel: false,
    type: db.Sequelize.QueryTypes.SELECT,
  });
  res.json(result);
};

exports.insertPages = async (req, res) => {
  const pages = req.body;

  // save pages
  // var newPages = pages.map((el) => [{ ...el, order_id: data.order_id }]);

  let pageIds = pages.map((pg) => {
    return pg.page_id;
  });

  var result = await Page.bulkCreate(pages, {
    updateOnDuplicate: Object.keys(Page.rawAttributes), //["page_id"], //  ["app_token", "app_id"]
    where: {
      page_id: pageIds,
    },
  })
    .then((response) => {
      return !response || response.length === 0
        ? { status: 400, error: "Failed to save pages." }
        : { status: 200, data: response };
    })
    .catch((err) => {
      return { status: 400, error: err.message };
    });

  return result.status === 200
    ? res.status(result.status).send(result.data)
    : res.status(result.status).send({ error: result.error });
};

exports.deletePage = (req, res) => {
  const { id } = req.body;
  
  Page.destroy({
    where: {
      id: id,
    },
  })
    .then((response) => {
      if (response === 1) return res.json("Page deleted successfully.");
      else return res.status(401).send({ error: "Page delete failed." });
    })
    .catch((error) => {
      return res.status(400).send({ error: error.message });
    });
};

exports.setActivePage = (req, res) => {
  let user_id = getUserIdFromToken(req);
  let app_id = req.body.app_id,
      page_id = req.body.page_id;
  const sql = `UPDATE pages SET "default" = false WHERE app_id = ${app_id} AND user_id = ${user_id}; 
               UPDATE pages SET "default" = true WHERE id = ${page_id} AND user_id = ${user_id};`;

  return db.sequelize
    .query(sql, {
      type: db.Sequelize.QueryTypes.UPDATE,
    })
    .then((results) => {
      return res.json(results);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

// Retrieve order
exports.getSingleOrder = (req, res) => {
  const { order_id } = req.body;

  Order.findByPk(order_id)
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.updateOrder = (req, res) => {
  let data = getOrderData(req);

  Order.findByPk(data.order_id)
    .then((order) => {
      if (!order) {
        return res.status(401).send({ error: "Order does not exist" });
      }
      if (!order.length > 1) {
        return res
          .status(401)
          .send({ error: "Multiple orders found for the id" });
      }

      delete data.order_id; // remove order_id from update
      delete data.subscription_id; // remove order_id from update
      delete data.client_id; // remove order_id from update

      order
        .update(data)
        .then((updatedOrder) => {
          return res.json(updatedOrder);
        })
        .catch((error) => {
          return res.status(400).send({ error: error.message });
        });
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.updateAppTokens = (req, res) => {
  const { order_details } = req.body;

  if (Object.keys(order_details).length === 0)
    return res.status(400).send({ error: "No apps found in payload." });

  let orderIds = order_details.map((od) => {
    return od.id;
  });

  // this bulk updates records for the given ids, for multicolumn update add columns to 'updateOnDuplicate' as string array
  OrderDetail.bulkCreate(order_details, {
    updateOnDuplicate: ["app_token"], //  ["app_token", "app_id"]
    where: {
      id: orderIds,
    },
  })
    .then((response) => {
      if (response && response.length > 0)
        return res.status(200).send("App tokens saved successfully.");
      else
        return res
          .status(400)
          .send({ error: "Update failed. No changes made." });
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.deleteOrder = (req, res) => {
  const { order_id } = req.body;

  Order.destroy({
    where: {
      order_id: order_id,
    },
  })
    .then((response) => {
      if (response === 1) return res.json("Order deleted successfully.");
      else return res.status(401).send({ error: "Order delete failed." });
    })
    .catch((error) => {
      return res.status(400).send({ error: error.message });
    });
};

// const saveOrderDetails = async (order, apps) => {

//     let newOrderDetails = apps.map((app) => {

//         let appItem = app.app_tokens.find(item => {
//             return item.app_id === app.app_id
//         });

//         return {
//             order_id: order.order_id,
//             app_id: app.app_id,
//             app_token: appItem?.app_token
//         }
//     });

//     OrderDetail.create(newOrderDetails)
//         .then((order_details) => {
//             return !order_details || order_details.length === 0 ? -1 : 1;
//         })
//         .catch((error) => {
//             return error;
//         });
// }

const getOrderData = (req) => {
  let authUserId = getUserIdFromToken(req);
  let {
    order_id,
    subscription_id,
    client_id,
    description,
    status,
    created_by,
    update_by,
  } = req.body;

  created_by = authUserId;
  update_by = authUserId;

  return {
    order_id: order_id,
    subscription_id: subscription_id,
    client_id: client_id,
    description: description,
    status: status,
    created_by: created_by,
    update_by: update_by,
  };
};

const getUserIdFromToken = (req) => {
  let userData = authUser(req);
  return userData.user_id;
};
