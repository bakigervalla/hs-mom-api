const FORMATS = {
    JSON: "JSON",
    XML: "XML"
}


module.exports = {
    OK: _OK,
    Error: _Error
}

/*
    Format for all API responses will be JSON
    {
        content: {...}
        error: {...}
    }
    Status code is sent in header.
    If error is not present, error should be null.
    If error is present, content can be null (But it's not required).
*/
function genericResponse(options = { res: null, status: 200, content: {}, error: null, format: FORMATS.JSON }) {
    try {
        const data = {
            content: options?.content ?? null,
            error: options?.error ?? null
        };

        switch (options?.format) {
            case FORMATS.JSON:
                return options?.res.status(options?.status).json(data);
            case FORMATS.XML:
                break;
            default: {
                const err = new Error("No response format specified.");
                throw err;
            }
        }
    }
    catch (error) {
        const err = new Error(`Could not create generic response: ${error.message}`);
        err.name = error?.name;
        err.code = error?.code;
        throw err;
    }
}

/**
 * Sends response with status code 200.
 * Should be called on all successful response.
 *
 * @param <Object> res
 * @param <Object> content
 * @param <String> format
 */
function _OK(options) {
    return genericResponse({
        ...options,
        status: 200,
        format: options?.format ?? FORMATS.JSON
    });
}

/**
 * Sends response with provided error code.
 * Should be called on all failed response.
 *
 * @param <Object> res
 * @param <Object> error
 * @param <Object> content (optional)
 * @param <Int>		 status
 * @param <String> format
 */
function _Error(options) {
    return genericResponse({
        ...options,
        status: options?.status ?? 500,
        format: options?.format ?? FORMATS.JSON
    });
}