const App = require("../../models").App;
const authUser = require("../../utils/helpers").authUser;
const db = require("../../models");

exports.getApps = (req, res) => {
  App.findAll({
    order: [["order_seq", "ASC"]],
  })
    .then((apps) => {
      if (apps.length === 0) {
        return res.status(400).send("No Apps");
      }
      return res.json(apps);
    })
    .catch((err) => {
      console.log("Apps err!", err);
      return res.status(400).send({ error: err.message });
    });
};

exports.getAppsByUser = async (req, res) => {
  let user_id = getUserId(req);
  // let { client_id } = req.body;
  // let wquery = client_id ? `c.client_id = ${client_id}` : `c."default" = true`;

  return db.sequelize
    .query(
      `
                select a.*, a.app_id = o.default_app_id is_default
                from users u
                inner join orders o on o.user_id = u.user_id
                inner join apps a on a.subscription_id = o.subscription_id 
                where u.user_id = ${user_id}
                order by order_seq;
        `,
      {
        model: App,
        mapToModel: true,
        type: db.Sequelize.QueryTypes.SELECT,
      }
    )
    .then((results) => {
      if (results.length === 0)
        return res.status(400).send({ error: "No Apps" });
      else return res.json(results);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.getAppsBySubscription = async (subscription_id) => {
  return App.findAll({
    where: {
      subscription_id: subscription_id,
    },
  })
    .then((apps) => {
      if (apps.length === 0) {
        return { status: 400, error: "No Apps" };
      }
      return { status: 200, data: apps };
    })
    .catch((err) => {
      return { status: 400, error: err.message };
    });
};

exports.saveApp = (req, res) => {
  let newApp = getAppData(req);

  delete newApp.app_id; // delete id from insert

  App.create(newApp)
    .then((data) => {
      return res.json(data);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

// Retrieve subscription
exports.getSingleApp = (req, res) => {
  const { app_id } = req.body;

  App.findByPk(app_id)
    .then((app) => {
      return res.json(app);
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.updateApp = (req, res) => {
  let data = getAppData(req);

  App.findByPk(data.app_id)
    .then((app) => {
      if (!app) {
        return res.status(401).send({ error: "App does not exist" });
      }
      if (!app.length > 1) {
        return res
          .status(401)
          .send({ error: "Multiple apps found for the id" });
      }

      delete data.app_id; // remove id from update

      app
        .update(data)
        .then((updatedApp) => {
          return res.json(updatedApp);
        })
        .catch((error) => {
          return res.status(400).send({ error: error.message });
        });
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

exports.deleteApp = (req, res) => {
  const { app_id } = req.body;

  App.destroy({
    where: {
      app_id: app_id,
    },
  })
    .then((response) => {
      if (response === 1) return res.json("App deleted successfully.");
      else return res.status(401).send({ error: "App delete failed." });
    })
    .catch((error) => {
      return res.status(400).send({ error: error.message });
    });
};

const getAppData = (req) => {
  let authUserId = getUserIdFromToken(req);
  let { app_id, subscription_id, name, created_by, update_by, image } =
    req.body;

  created_by = authUserId;
  update_by = authUserId;

  return {
    app_id: app_id,
    subscription_id: subscription_id,
    name: name,
    created_by: created_by,
    update_by: update_by,
    image: image,
  };
};

const getUserId = (req) => {
  let userData = authUser(req);
  console.log(userData);
  switch (userData.isAdmin) {
    case true:
      return req.body.user_id ?? userData.user_id;
    default:
      return userData.user_id;
  }
};

const getUserIdFromToken = (req) => {
  let userData = authUser(req);
  return userData.user_id;
};
