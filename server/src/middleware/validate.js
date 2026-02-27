// A small helper that validates an incoming request body against a Zod schema.
// If validation fails, it throws a ZodError that the centralized error handler will catch
// and convert into a clean 400 response with field-level details.
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validate;
