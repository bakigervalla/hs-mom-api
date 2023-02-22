const Client = require('../../models').Client;
const authUser = require('../../utils/helpers').authUser;

exports.getClients = (req, res) => {
    let user_id = getUserId(req);

    Client.findAll({
        where: {
            user_id: user_id,
        },
    })
        .then((clients) => {
            if (clients.length === 0) {
                return res.status(400).send('No clients');
            }
            return res.json(clients);
        })
        .catch((err) => {
            console.log('Clients err!', err);
            return res.status(400).send({ error: err.message });
        });
};

exports.saveClient = async (req, res) => {
    let newClient = getClientData(req);

    delete newClient.client_id;  // delete client_id from insert

    var result = await this.insertClient(newClient);

    if (result.status === 200)
        return res.status(result.status).send(result.data);
    else
        return res.status(result.status).send({ error: result.error });

};

exports.insertClient = async (newClient) => {
    return await Client.create(newClient)
        .then((data) => {
            return { status: 200, data: data };
        })
        .catch((err) => {
            return { status: 400, error: err.message };
        });
};

// Retrieve the authenticated user
exports.getSingleClient = (req, res) => {
    let user_id = getUserId(req);
    const { client_id } = req.body;

    Client.findAll({
        where: {
            user_id: user_id,
            client_id: client_id
        }
    })
        .then((clients) => {
            return res.json(clients);
        })
        .catch((err) => {
            return res.status(400).send({ error: err.message });
        });
};

exports.updateClient = (req, res) => {
    let data = getClientData(req);

    Client.findAll({
        where: {
            client_id: data.client_id,
            user_id: data.user_id
        }
    })
        .then((client) => {
            if (!client) {
                return res.status(401).send({ error: 'Client does not exist' });
            }
            if (!client.length > 1) {
                return res.status(401).send({ error: 'Multiple clients found for the id' });
            }
            delete data.user_id; // remove user_id from update
            delete data.client_id; // remove client_id from update
            client[0].update(data)
                .then((updatedClient) => {
                    // console.log('===== UPDATED ===== \n', updatedClient);
                    return res.json(updatedClient);
                })
                .catch((error) => {
                    // console.log('updating client err!', error);
                    return res.status(400).send({ error: error.message });
                });
        })
        .catch((err) => {
            // console.log('finding updating client err!', err);
            return res.status(400).send({ error: err.message });
        });
};

exports.deleteClient = (req, res) => {
    let data = getClientData(req);

    Client.destroy({
        where: {
            client_id: data.client_id,
            user_id: data.user_id
        }
    })
        .then((response) => {
            if (response === 1)
                return res.json("Client deleted successfully.")
            else
                return res.status(401).send({ error: 'Client delete failed.' });
        })
        .catch((error) => {
            // console.log('updating client err!', error);
            return res.status(400).send({ error: error.message });
        });
};

const getClientData = (req) => {
    let userId = getUserId(req)
    let authUserId = getUserIdFromToken(req)
    let { client_id, name, address, country, email, phone, client_uri, logo_uri, created_by, update_by } = req.body;

    created_by = authUserId;
    update_by = authUserId;
    
    return {
        user_id: userId, client_id: client_id, name: name, address: address, country: country, email: email, phone: phone,
        client_uri: client_uri, logo_uri: logo_uri, created_by: created_by, update_by: update_by
    }
}

const getUserId = (req) => {
    let userData = authUser(req)
    switch (userData.isAdmin) {
        case true:
            return req.query.user_id.trim();
        default:
            return userData.user_id;
    }
}

const getUserIdFromToken = (req) => {
    let userData = authUser(req)
    return userData.user_id;
}