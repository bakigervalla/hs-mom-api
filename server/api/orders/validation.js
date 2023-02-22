const yup = require('yup');

let schemas = [
    yup.object().shape({
        order_id: yup.number().required()
    }),
    yup.object().shape({
        order_details: yup.object().required()
    }),
    // yup.object().shape({
    //     client_id: yup.number().required()
    // }),
    yup.object().shape({
        subscription_id: yup.string().required(),
        // client_id: yup.string().required(),
        status: yup.string().required()
    }),
    yup.object().shape({
        order_id: yup.number().required(),
        subscription_id: yup.string().required(),
        // client_id: yup.string().required(),
        description: yup.string().required(),
        status: yup.string().required()
    }),

];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'getSingleOrder':
                case 'deleteOrder':
                    schema = schemas[0];
                    break;
                case 'updateAppTokens':
                    schema = schemas[1];
                    break;
                case 'getOrders':
                    schema = schemas[2];
                    break;
                case 'saveOrder':
                    schema = schemas[3];
                    break;
                case 'updateOrder':
                    schema = schemas[4];
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