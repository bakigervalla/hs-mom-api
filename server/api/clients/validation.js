const yup = require('yup');

let schemas = [
    yup.object().shape({
        client_id: yup.number().required()
    }),
    yup.object().shape({
        name: yup.string().required(),
        address: yup.string().required(),
        country: yup.string().required(),
        email: yup.string().required().email(),
        phone: yup.string().required(),
        client_uri: yup.string().required(),
        logo_uri: yup.string().required(),
    }),
    yup.object().shape({
        client_id: yup.string().required(),
        name: yup.string().required(),
        address: yup.string().required(),
        country: yup.string().required(),
        email: yup.string().required().email(),
        phone: yup.string().required(),
        client_uri: yup.string().required(),
        logo_uri: yup.string().required(),
    })
];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'getSingleClient':
                case 'deleteClient':
                    schema = schemas[0];
                    break;
                case 'saveClient':
                    schema = schemas[1];
                    break;
                case 'updateClient':
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