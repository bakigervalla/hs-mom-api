const router = require("express").Router();
const controller = require("./controller");
const auth = require("../../auth/auth");

const validate = require("./validation").validate;
const checkUser = [auth.decodeToken()];

// endpoint: /api/apps
router
  .route("/find")
  .get([checkUser, validate("getSingleOrder")], controller.getSingleOrder); // TBD if not Admin check if order_id belongs to this user

  router.route("/pages/all").get(checkUser, controller.getAllPages)
router.route("/pages").get(checkUser, controller.getPages)

router
  .route("/pages")
  .post(checkUser, controller.insertPages)
  .delete(checkUser, controller.deletePage);
  

// .put([checkUser, validate('updateAppTokens')], controller.updateAppTokens)
router.route("/setactiveapp").post(checkUser, controller.setActiveApp);
router.route("/setactivepage").post(checkUser, controller.setActivePage);

router
  .route("")
  .get([checkUser, validate("getOrders")], controller.getOrders)
  .post([checkUser, validate("saveOrder")], controller.saveOrder)
  .put([checkUser, validate("updateOrder")], controller.updateOrder)
  .delete([checkUser, validate("deleteOrder")], controller.deleteOrder);

module.exports = router;
