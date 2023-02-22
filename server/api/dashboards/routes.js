const router = require('express').Router();
const controller = require('./controller');
const auth = require('../../auth/auth');

const validate = require('./validation').validate;
const checkUser = [auth.decodeToken()]

// endpoint: /api/dashboards
router.route('/find')
    .get([checkUser, validate('getSingleDashboard')], controller.getSingleDashboard)

router.route('')
    .get(checkUser, controller.getDashboards)
    .post([checkUser, validate('saveDashboard')], controller.saveDashboard)
    .put([checkUser, validate('updateDashboard')], controller.updateDashboard)
    .delete([checkUser, validate('deleteDashboard')], controller.deleteDashboard);

module.exports = router;
