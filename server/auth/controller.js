// const User = require('../models').users;
const signToken = require('./auth').signToken;

exports.signin = (req, res) => {
    const { id, username, first_name, last_name, address, phone, photo_url, email } = req.user;

    // req.user will be there from the middleware
    // verify user. Then we can just create a token
    // and send it back for the client to consume
    console.log('exports.signin ', id);

    const token = signToken(id);
    res.json({
        token,
        user: {
            username: username,
            first_name: first_name,
            last_name: last_name,
            address: address,
            phone: phone,
            photo_url: photo_url,
            email: email,
        },
    });
};