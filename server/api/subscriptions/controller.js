const Subscription = require('../../models').Subscription;
const App = require('../../models').App;
const authUser = require('../../utils/helpers').authUser;

exports.getSubscriptions = (req, res) => {
    Subscription.findAll({
        order: [
            ['order', 'ASC']
        ]
    })
        .then((subscriptions) => {
            if (subscriptions.length === 0) {
                return res.status(400).send('No Subscriptions');
            }
            return res.json(subscriptions);
        })
        .catch((err) => {
            console.log('Subscriptions err!', err);
            return res.status(400).send({ error: err.message });
        });
};

exports.saveSubscription = (req, res) => {
    let newSubscription = getSubscriptionData(req);

    delete newSubscription.id;  // delete id from insert

    Subscription.create(newSubscription)
        .then((data) => {
            return res.json(data);
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.getSubscription = async (subscription_id) => {
    let query = subscription_id === '' ? { is_default: true } : { subscription_id: subscription_id };

    return await Subscription.findAll({
        query,
        include: { model: App, as: 'Apps' }
    })
        .then((subscription) => {
            if (subscription && subscription.length > 0)
                return { status: 200, data: subscription[0] };
            else
                return { status: 400, error: 'No Subscriptions' };
        })
        .catch((err) => {
            return { status: 400, error: err.message };
        });
};

// Retrieve subscription
exports.getSingleSubscription = (req, res) => {
    const { id } = req.body;

    Subscription.findByPk(id)
        .then((subscriptions) => {
            return res.json(subscriptions);
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.updateSubscription = (req, res) => {
    let data = getSubscriptionData(req);

    Subscription.findByPk(data.id)
        .then((subscription) => {
            if (!subscription) {
                return res.status(401).send({ error: 'Subscription does not exist' });
            }
            if (!subscription.length > 1) {
                return res.status(401).send({ error: 'Multiple subscriptions found for the id' });
            }

            delete data.id; // remove id from update

            subscription.update(data)
                .then((updatedSubscription) => {
                    return res.json(updatedSubscription);
                })
                .catch((error) => {
                    return res.status(400).send({ error: error.message });
                });
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.deleteSubscription = (req, res) => {
    const { id } = req.body;

    Subscription.destroy({
        where: {
            id: id
        }
    })
        .then((response) => {
            if (response === 1)
                return res.json("Subscription deleted successfully.")
            else
                return res.status(401).send({ error: 'Subscription delete failed.' });
        })
        .catch((error) => {
            return res.status(400).send({ error: error.message });
        });
};

const getSubscriptionData = (req) => {
    let authUserId = getUserIdFromToken(req)
    let { id, name, period, price, is_default, is_active, created_by, update_by } = req.body;

    created_by = authUserId;
    update_by = authUserId;

    return {
        id: id, name: name, period: period, price: price, is_default: is_default, is_active: is_active, created_by, update_by
    }
}

const getUserIdFromToken = (req) => {
    let userData = authUser(req)
    return userData.user_id;
}