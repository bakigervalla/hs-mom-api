const yup = require('yup');
const authUser = require('../../utils/helpers').authUser;

// let schema = yup.object().shape({
//     name: yup.string().required(),
//     age: yup.number().required().positive().integer(),
//     email: yup.string().email(),
//     website: yup.string().url(),
//     createdOn: yup.date().default(function () {
//         return new Date();
//     }),
// });

let schemas = [
    yup.object({
        user: yup.object().shape({
            email: yup.string().required().email(),
            password: yup.string().required()
        })
    }),
    yup.object().shape({
        email: yup.string().required().email()
    }),
    yup.object().shape({
        token: yup.string().required(),
        password: yup.string().required()
    }),
    yup.object().shape({
        current_password: yup.string().required(),
        password: yup.string().required()
    }),
    yup.object().shape({
        user_id: yup.string().required()
    }),
    yup.object().shape({
        email: yup.string().required().email(),
        password: yup.string().required(),
        subscription_id: yup.string().required(),
    }),
    yup.object().shape({
        user_id: yup.string().required(),
        email: yup.string().required().email(),
        full_name: yup.string().required()
    }),
    yup.object().shape({
        full_name: yup.string().required()
    }),

];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'login':
                    schema = schemas[0];
                    break;
                case 'requestPasswordReset':
                    schema = schemas[1];
                    break;
                case 'resetPassword':
                    schema = schemas[2];
                    break;
                case 'changePassword':
                    schema = schemas[3];
                    break;
                case 'getSingleUser':
                    schema = schemas[4];
                    break;
                case 'createUser':
                    schema = schemas[5];
                    break;
                case 'updateUser':
                    schema = authUser(req).isAdmin
                        ? schemas[6]
                        : schemas[7];
                    break;
            }

            const validatedBody = await schema.validate(req.body);
            req.body = validatedBody;
            next();
        } catch (err) {
            next(res.json(err.message));
        }
    };
}