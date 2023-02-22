const router = require('express').Router();
const controller = require('./controller');
const auth = require('../../auth/auth');

const validate = require('./validation').validate;
const checkUser = [auth.decodeToken()]

// endpoint: /api/clients
router.route('/find')
    .get([checkUser, validate('getSingleClient')], controller.getSingleClient)

router.route('')
    .get(checkUser, controller.getClients)
    .post([checkUser, validate('saveClient')], controller.saveClient)
    .put([checkUser, validate('updateClient')], controller.updateClient)
    .delete([checkUser, validate('deleteClient')], controller.deleteClient);

module.exports = router;
