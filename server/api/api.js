const router = require('express').Router();

// api router will mount other routers for all our resources
router.use('/users', require('./users/routes'));
router.use('/clients', require('./clients/routes'));
router.use('/subscriptions', require('./subscriptions/routes'));
router.use('/apps', require('./apps/routes'));
router.use('/orders', require('./orders/routes'));
router.use('/dashboards', require('./dashboards/routes'));
// router.use('/admin', require('./admin/routes'));

module.exports = router;