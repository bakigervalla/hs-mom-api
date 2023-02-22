const router = require("express").Router();
const controller = require("./controller");
const auth = require("../../auth/auth");

const validate = require("./validation").validate;
const isAuthenticated = [auth.decodeToken()];
const checkUser = [auth.decodeToken(), auth.isAdmin()];

// endpoint: /api/apps
router
  .route("/find")
  .get([checkUser, validate("getSingleApp")], controller.getSingleApp);
router.route("/userapps").get(isAuthenticated, controller.getAppsByUser);

router
  .route("")
  .get(checkUser, controller.getApps)
  .post([checkUser, validate("saveApp")], controller.saveApp)
  .put([checkUser, validate("updateApp")], controller.updateApp)
  .delete([checkUser, validate("deleteApp")], controller.deleteApp);

module.exports = router;
