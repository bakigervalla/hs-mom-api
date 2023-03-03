const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Mailgun = require("mailgun-js");
const sendEmail = require("../../utils/email/sendEmail").sendEmail;

const User = require("../../models").User;
const Client = require("../../models").Client;
const signToken = require("../../auth/auth").signToken;
const generatePassword = require("../../utils/helpers").generatePassword;
const generateEmailTemplate =
  require("../../utils/helpers").generateEmailTemplate;
const authUser = require("../../utils/helpers").authUser;
const CrtSubscription = require("../subscriptions/controller");
const CrtClient = require("../clients/controller");
const CrtOrder = require("../orders/controller");

const db = require("../../models");

// get the user; auth middleware verifies the token
exports.verifyUser = async (req, res) => {
  const user_id = getUserIdFromToken(req);
  const user = await User.findByPk(user_id);

  if (!user) return res.status(400).send({ error: "Cannot find user." });

  const result = await db.sequelize.query(
    `select subscription_id from orders where user_id = ${user_id};`,
    {
      model: User,
      mapToModel: false,
      type: db.Sequelize.QueryTypes.SELECT,
    }
  );

  res.json({
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user.first_name} ${user.last_name}`,
    address: user.address,
    phone: user.phone,
    email_confirmed: user.role,
    subscriptions: result,
  });
};

/**
 * verifyUser is executed in the auth middleware
 */
exports.login = (req, res) => {
  return res.json(signToken(req.user));
};

/**
 * saveUser: Create new user on signup
 * getSingleUser: Retrieve one user
 */
exports.createUser = (req, res) => {
  const { full_name, email, password, subscription_id } = req.body;
  const _name = full_name.split(" "),
    fname = _name[0] ?? "",
    lname = _name[1] ?? "";

  User.findAll({
    where: { email: email },
  })
    .then((user) => {
      if (user.length > 0) {
        return res
          .status(400)
          .send({ error: "The email is already registered." });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const newUser = {
        email,
        first_name: fname,
        last_name: lname,
        password: hash,
        is_admin: false,
        role: "client",
      };

      User.create(newUser)
        .then(async (data) => {
          // get current user
          let authUserId = data.user_id;

          // add self as new client
          let newClient = {
            user_id: data.user_id,
            name: data.email.replace(/@.*$/, ""),
            email: data.email,
            created_by: authUserId,
            update_by: authUserId,
            default: true,
          };
          let client = await CrtClient.insertClient(newClient);
          if (client.status !== 200)
            return res.status(client.status).send({ error: client.error });

          // get default (free) subscription apps if user has chosen free subscription during registration
          let subscription = await CrtSubscription.getSubscription(
            subscription_id
          );

          if (subscription.status !== 200)
            return res
              .status(subscription.status)
              .send({ error: subscription.error });

          // create and save order
          let newOrder = {
            subscription_id: subscription.data.id,
            user_id: data.user_id,
            //client_id: client.data.client_id,
            description: "Order created on user registration",
            status: true,
            created_by: authUserId,
            update_by: authUserId,
          };

          // add default or chosen subscription_plan
          var result = await CrtOrder.insertOrder(
            newOrder,
            subscription.data.Apps
          );

          return result.status === 200
            ? res.status(result.status).send(Object.assign(signToken(data)))
            : res.status(result.status).send({ error: result.error });
        })
        .catch((err) => {
          // console.error('Error on saving user: ', err);
          return res.status(400).send({ error: err.message });
        });
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

// Retrieve the authenticated user
exports.getSingleUser = (req, res) => {
  User.findByPk(req.user_id)
    .then((user) => {
      if (!user) {
        // if no user is found it was not
        // it was a valid JWT but didn't decode
        // to a real user in our DB. Either the user was deleted
        // since the client got the JWT, or
        // it was a JWT from some other source
        return res.status(401).send({ error: "Unauthorized" });
      }
      // update req.user with fresh user from
      // stale token data & never send password back!
      // console.log('>>>>>\n', user)
      Client.findAll({
        where: {
          user_id: req.user_id,
        },
      })
        .then((clients) => {
          if (clients.length > 0) {
            const clientIds = [];
            clients.forEach((client) => {
              clientIds.push(client.client_id);
            });

            return res.json({
              id: user.user_id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              clientIds,
            });
          }

          return res.json({
            id: user._user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          });
        })
        .catch((err) => {
          return res.status(400).send({ error: err.message });
        });
    })
    .catch((err) => {
      // console.log('getSignedInUserData err!', err);
      return res.status(400).send({ error: err.message });
    });
};

exports.updateUser = (req, res) => {
  let data = getUserData(req);

  User.findByPk(data.user_id)
    .then((user) => {
      if (!user) {
        return res.status(401).send({
          error: "Unable to update profile. Authorization invalid or expired.",
        });
      }
      // delete data.user_id; // remove user_id from update
      user
        .update(data)
        .then((user) => {
          // console.log('===== UPDATED ===== \n', updatedUser);
          return res.json({
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
            },
          });
        })
        .catch((error) => {
          // console.log('updating user err!', error);
          return res.status(400).send({ error: error.message });
        });
    })
    .catch((err) => {
      // console.log('finding updating user err!', err);
      return res.status(400).send({ error: err.message });
    });
};

exports.changePassword = (req, res) => {
  const { current_password, password } = req.body;

  let user_id = getUserIdFromToken(req);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.findByPk(user_id)
    .then(async (user) => {
      const is_valid = await bcrypt.compare(current_password, user.password);
      if (!user || !is_valid) {
        return res
          .status(400)
          .send({ error: "Change password failed. Invalid password." });
      }
      user
        .update({ password: hash })
        .then(() => {
          return res.json("Password changed successfully.");
        })
        .catch((error) => {
          return res.status(400).send({ error: error.message });
        });
    })
    .catch((err) => {
      // console.log('finding updating user err!', err);
      return res.status(400).send({ error: err.message });
    });
};

// Send reset password confirmation email with reset link
exports.requestPasswordReset = (req, res) => {
  const { redirectUrl, email } = req.body;

  if (email.length === 0 || email.trim().length === 0) {
    return res.status(400).send({ error: "Email required" });
  }

  User.findAll({ where: { email } })
    .then(async (user) => {
      // console.log('USER CHECK', user[0].email, email)
      if (user[0] && user[0].email === email) {
        // prepare placeholders
        let resetToken = crypto.randomBytes(32).toString("hex");
        //const hash = await bcrypt.hash(resetToken, 10);
        // const link = `${process.env.CLIENT_URL}/reset-password?token=${encodeURI(resetToken)}`;
        const link = `${redirectUrl}/reset-password?token=${encodeURI(
          resetToken
        )}`;

        user[0]
          .update({ email_confirm_token: resetToken }) // { email_confirm_token: resetToken }
          .then(async () => {
            // send confirmation email
            var result = await sendEmail(
              user[0].email,
              {
                name: user[0].first_name,
                link: link,
              },
              "../../utils/email/template/requestResetPassword.handlebars"
            );

            if (result.status === 200) {
              return res
                .status(200)
                .send(
                  `${result.message} Reset password link was sent to your email.`
                );
            } else return res.status(400).send({ error: result.error });
          })
          .catch((err) => {
            return res.status(400).send({ error: err.message });
          });
      } else {
        // console.log('User err!', user);
        return res.status(401).send({ error: "Unauthorized" });
      }
    })
    .catch((err) => {
      // console.log('finding user err!', err);
      return res.status(400).send({ error: err.message });
    });
};

exports.resetPassword = (req, res) => {
  const { token, password } = req.body;

  User.findAll({ where: { email_confirm_token: decodeURI(token) } })
    .then(async (user) => {
      if (!user[0])
        return res
          .status(400)
          .send({ error: "Invalid or expired password reset token" });

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      user[0]
        .update({ password: hash, email_confirm_token: null })
        .then(() => {
          return res.status(200).send("Password has been reset successfully.");
        })
        .catch((err) => {
          return res.status(400).send({ error: err.message });
        });
    })
    .catch((err) => {
      return res.status(400).send({ error: err.message });
    });
};

// Obsolete: Replaced by Confirmation Email Link
exports.sendNewPassword = (req, res) => {
  const { email } = req.body;

  if (email.length === 0 || email.trim().length === 0) {
    return res.status(400).send({ error: "Email required" });
  }

  const newPassword = generatePassword();

  User.findAll({ where: { email } })
    .then((user) => {
      // console.log('USER CHECK', user[0].email, email)
      if (user[0] && user[0].email === email) {
        // Update password and send the new password with mailgun
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        user[0]
          .update({ password: hash })
          .then((updatedUser) => {
            const mailgun = new Mailgun({
              apiKey: process.env.MAILGUN_API_KEY,
              domain: process.env.MAILGUN_DOMAIN,
            });

            sendEmail();

            const data = {
              from: `Homesourcing Admin <info@${process.env.MAILGUN_DOMAIN}>`,
              to: updatedUser.email,
              subject: "[Homesourcing Admin] - New Password",
              html: generateEmailTemplate(user.name, newPassword),
            };

            // console.log('NEW PASS: ', newPassword);

            mailgun
              .messages()
              .send(data)
              .then((result) => {
                console.log("Mailgun success!!", result);
                return res.status(200).send("Check your email!");
              })
              .catch((err) => {
                // console.log('Mailgun user err!', err);
                return res.status(400).send({ error: err.message });
              });
          })
          .catch((error) => {
            console.log("User update err!", error);
            return res.status(401).send({ error: "Unauthorized" });
          });
      } else {
        // console.log('User err!', user);
        return res.status(401).send({ error: "Unauthorized" });
      }
    })
    .catch((err) => {
      // console.log('finding user err!', err);
      return res.status(400).send({ error: err.message });
    });
};

const getUserData = (req) => {
  let userData = authUser(req);
  let {
    email,
    full_name,
    address,
    phone,
    email_confirmed,
    is_enabled,
    is_locked,
  } = req.body;
  let user_id = userData.user_id;

  let name = full_name.split(" ");

  switch (userData.isAdmin) {
    case true:
      return {
        user_id: user_id,
        email: email,
        first_name: name[0],
        last_name: name[1],
        phone: phone,
        address: address,
        email_confirmed: email_confirmed,
        is_enabled: is_enabled,
        is_locked: is_locked,
      };
    default:
      return {
        user_id: user_id,
        first_name: name[0],
        last_name: name[1],
        phone: phone,
        address: address,
      };
  }
};

// const getUserId = (req) => {
//     let userData = authUser(req);
//     switch (userData.isAdmin) {
//         case true:
//             return req.body.user_id.trim() || req.body.user_id;
//         default:
//             return userData.user_id;
//     }
// };

const getUserIdFromToken = (req) => {
  let userData = authUser(req);
  return userData.user_id;
};
