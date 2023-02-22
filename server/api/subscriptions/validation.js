const yup = require('yup');

let schemas = [
    yup.object().shape({
        id: yup.number().required()
    }),
    yup.object().shape({
        name: yup.string().required(),
        period: yup.number().required(),
        price: yup.number().required(),
        is_default: yup.boolean(),
        is_active: yup.boolean()
    }),
    yup.object().shape({
        id: yup.number().required(),
        name: yup.string().required(),
        period: yup.number().required(),
        price: yup.number().required(),
        is_default: yup.boolean(),
        is_active: yup.boolean()
    })
];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'getSingleSubscription':
                case 'deleteSubscription':
                    schema = schemas[0];
                    break;
                case 'saveSubscription':
                    schema = schemas[1];
                    break;
                case 'updateSubscription':
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