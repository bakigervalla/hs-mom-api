const yup = require('yup');

let schemas = [
    yup.object().shape({
        id: yup.number().required()
    }),
    yup.object().shape({
        client_id: yup.string().required(),
        app_id: yup.string().required(),
        title: yup.string().required(),
        description: yup.string().required(),
        is_active: yup.boolean()
    }),
    yup.object().shape({
        id: yup.number().required(),
        client_id: yup.string().required(),
        app_id: yup.string().required(),
        title: yup.string().required(),
        description: yup.string().required(),
        is_active: yup.boolean()
    }),

];

exports.validate = (type) => {
    return async (req, res, next) => {
        try {

            let schema = null;
            switch (type) {
                case 'getSingleDashboard':
                case "deleteDashboard":
                    schema = schemas[0];
                    break;
                case 'saveDashboard':
                    schema = schemas[1];
                    break;
                case 'updateDashboard':
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