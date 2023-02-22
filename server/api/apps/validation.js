const yup = require('yup');

let schemas = [
    yup.object().shape({
        app_id: yup.number().required()
    }),
    yup.object().shape({
        subscription_id: yup.string().required(),
        name: yup.string().required()
    }),
    yup.object().shape({
        app_id: yup.number().required(),
        name: yup.string().required()
    }),
];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'getSingleApp':
                case 'deleteApp':
                    schema = schemas[0];
                    break;
                case 'saveApp':
                    schema = schemas[1];
                    break;
                case 'updateApp':
                    schema = schemas[2];
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