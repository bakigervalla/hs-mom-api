var jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const bcrypt = require("bcrypt");
const config = require("../config");
const db = require("../models");
const atob = require("atob");

const checkToken = expressjwt({
    secret: config.secrets.jwt,
    algorithms: ["sha1", "RS256", "HS256"],
});
const User = require("../models").User;

/**
 *  Decode user's token
 * */
exports.decodeToken = () => {
    return (req, res, next) => {
        // [OPTIONAL]
        // make it optional to place token on query string
        // if it is, place it on the headers where it should be
        // so checkToken can see it. See follow the 'Bearer 034930493' format
        // so checkToken can see it and decode it
        if (
            req.query &&
            Object.prototype.hasOwnProperty.call(req.query, "access_token")
        ) {
            req.headers.authorization = "Bearer " + req.query.access_token;
        }
        // this will call next if token is valid
        // and send error if it is not. It will attached
        // the decoded token to req.user
        checkToken(req, res, next);
    };
};

exports.isAdmin = () => {
    return (req, res, next) => {
        let token = req?.headers?.authorization;
        if (!token) return false;

        let jwtData = token.split(".")[1];
        let decodedJwtJsonData = atob(jwtData);
        let decodedJwtData = JSON.parse(decodedJwtJsonData);

        if (decodedJwtData.role !== "admin")
            res.status(401).send({ error: "Unauthorized" });
        else next();
    };
};

/**
 * Set req.user to the authenticated user if JWT is valid & user is found in DB
 * Otherwise return error
 */
exports.getFreshUser = () => {
    return (req, res, next) => {
        const { user_id } = req.body;
        User.findByPk(user_id)
            .then((user) => {
                if (!user) {
                    // if no user is found, but
                    // it was a valid JWT but didn't decode
                    // to a real user in our DB. Either the user was deleted
                    // since the client got the JWT, or
                    // it was a JWT from some other source
                    res.status(401).send({ error: "Unauthorized" });
                } else {
                    // update req.user with fresh user from
                    // stale token data
                    req.user = user;
                    // console.log('getFreshUser then \n', req.user);
                    next();
                }
            })
            .catch((err) => {
                console.log("getFreshUser catch \n", err);
                next(err);
            });
    };
};

/**
 * Just check if user has JWT (user is logged in or not)
 */
exports.hasJWT = () => {
    return (req, res, next) => {
        if (req.headers.authorization.length > 20) {
            if (
                req.query &&
                Object.prototype.hasOwnProperty.call(req.query, "access_token")
            ) {
                req.headers.authorization = "Bearer " + req.query.access_token;
            }
            checkToken(req, res, next);
        } else {
            next();
        }
    };
};

/**
 * Authenticate the user
 * */
exports.verifyUser = () => {
    return (req, res, next) => {
        const { email, password } = req.body;
        // if no email or password then send
        if (!email || !password)
            return res.status(400).send({ error: "You need an email and password" });



        // look user up in the DB so we can check
        // if the passwords match for the email
        User.findAll({
            where: {
                email,
            },
        })
            .then((user) => {
                if (user.length == 0) {
                    return res.status(401).send({ error: "Invalid login credentials" });
                } else if (!user[0].is_enabled || user[0].is_locked)
                    return res.status(401).send({ error: "User is locked" });
                else {
                    // checking the passwords here
                    if (!bcrypt.compareSync(password, user[0].password)) {
                        return res.status(401).send({ error: "Invalid login credentials" });
                    } else {
                        // if everything is good,
                        // then attach to req.user
                        // and call next so the controller
                        // can sign a token from the req.user._id

                        req.user = user[0];

                        // get user subscriptions
                        db.sequelize
                            .query(
                                `
                            select subscription_id
                            from orders   
                            where user_id = ${req.user.user_id};
                        `,
                                {
                                    model: User,
                                    mapToModel: false,
                                    type: db.Sequelize.QueryTypes.SELECT,
                                }
                            )
                            .then((result) => {
                                req.user.subscriptions = result;
                                next();
                            })
                            .catch((err) => {
                                return res.status(400).send({ error: err.message });
                            });
                    }
                }
            })
            .catch((err) => {
                next(err);
            });
    };
};

/**
 * Sign token on signup
 */
exports.signToken = (user) => {
    const { user_id, role } = user;
    return {
        token: jwt.sign({ user_id, role }, config.secrets.jwt, {
            expiresIn: config.expireTime,
        }),
        user: {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            full_name: `${user.first_name} ${user.last_name}`,
            address: user.address,
            phone: user.phone,
            email_confirmed: user.role,
            subscriptions: user.subscriptions,
        },
    };
};
