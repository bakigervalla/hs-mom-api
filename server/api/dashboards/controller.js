const Dashboard = require('../../models').Dashboard;
const authUser = require('../../utils/helpers').authUser;

exports.getDashboards = (req, res) => {
    let user_id = getUserId(req);

    Dashboard.findAll({
        where: {
            user_id: user_id,
        },
    })
        .then((dashboards) => {
            if (dashboards.length === 0) {
                return res.status(400).send('No Dashboards');
            }
            return res.json(dashboards);
        })
        .catch((err) => {
            console.log('Dashboards err!', err);
            return res.status(400).send({ error: err.message });
        });
};

exports.saveDashboard = (req, res) => {
    let newDashboard = getDashboardData(req);

    delete newDashboard.id;  // delete dashboard_id from insert

    Dashboard.create(newDashboard)
        .then((data) => {
            return res.json(data);
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

// Retrieve dashboard
exports.getSingleDashboard = (req, res) => {
    let user_id = getUserId(req);
    const { id } = req.body;

    Dashboard.findAll({
        where: {
            user_id: user_id,
            id: id
        }
    })
        .then((dashboards) => {
            return res.json(dashboards);
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.updateDashboard = (req, res) => {
    let data = getDashboardData(req);

    Dashboard.findAll({
        where: {
            id: data.id,
            user_id: data.user_id
        }
    })
        .then((dashboard) => {
            if (!dashboard) {
                return res.status(401).send({ error: 'Dashboard does not exist' });
            }
            if (!dashboard.length > 1) {
                return res.status(401).send({ error: 'Multiple dashboards found for the id' });
            }

            delete data.user_id; // remove user_id from update
            delete data.id; // remove dashboard_id from update

            dashboard[0].update(data)
                .then((updatedDashboard) => {
                    return res.json(updatedDashboard);
                })
                .catch((error) => {
                    return res.status(400).send({ error: error.message });
                });
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.deleteDashboard = (req, res) => {
    let data = getDashboardData(req);

    Dashboard.destroy({
        where: {
            id: data.id,
            user_id: data.user_id
        }
    })
        .then((response) => {
            if (response === 1)
                return res.json("Dashboard deleted successfully.")
            else
                return res.status(401).send({ error: 'Dashboard delete failed.' });
        })
        .catch((error) => {
            return res.status(400).send({ error: error.message });
        });
};

const getDashboardData = (req) => {
    let userId = getUserId(req)
    let { id, client_id, app_id, title, description, is_active, is_default } = req.body;

    return {
        id: id, user_id: userId, client_id: client_id, app_id: app_id, title: title, description: description, is_active: is_active, is_default: is_default
    }
}

const getUserId = (req) => {
    let userData = authUser(req)
    switch (userData.isAdmin) {
        case true:
            return req.body.user_id.trim() || req.body.user_id;
        default:
            return userData.user_id;
    }
}