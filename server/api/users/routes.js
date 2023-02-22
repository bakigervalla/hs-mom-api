const router = require("express").Router();
const controller = require("./controller");
const auth = require("../../auth/auth");

const validate = require("./validation").validate;
const checkUser = [auth.decodeToken()]; //, auth.getFreshUser()];

// endpoint: /api/users
router.route("/login").post(auth.verifyUser("login"), controller.login);
router.route("/auth").post(checkUser, controller.verifyUser);
router
  .route("/request-reset-password")
  .post(validate("requestPasswordReset"), controller.requestPasswordReset); // sendNewPassword (generates new password and sends by email)
router
  .route("/reset-password")
  .post(validate("resetPassword"), controller.resetPassword);

router
  .route("/change-password")
  .put([checkUser, validate("changePassword")], controller.changePassword);
  
router
  .route("")
  .get([checkUser, validate("getSingleUser")], controller.getSingleUser)
  .post(validate("createUser"), controller.createUser)
  .put([checkUser, validate("updateUser")], controller.updateUser);

module.exports = router;
