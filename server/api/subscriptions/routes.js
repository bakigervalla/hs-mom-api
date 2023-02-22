const router = require('express').Router();
const controller = require('./controller');
const auth = require('../../auth/auth');

const validate = require('./validation').validate;
const checkUser = [auth.decodeToken(), auth.isAdmin()]

// endpoint: /api/subscriptions
router.route('/find')
    .get(validate('getSingleSubscription'), controller.getSingleSubscription)

router.route('')
    .get(controller.getSubscriptions)
    .post([checkUser, validate('saveSubscription')], controller.saveSubscription)
    .put([checkUser, validate('updateSubscription')], controller.updateSubscription) 
    .delete([checkUser, validate('deleteSubscription')], controller.deleteSubscription);

module.exports = router;
