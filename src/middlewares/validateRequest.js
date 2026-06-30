export const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body || {},
            query: req.query || {},
            params: req.params || {},
        });
        return next();
    } catch (error) {
        if (error.name === "ZodError" || error.issues || error.errors) {
            const issues = error.issues || error.errors || [];
            const errors = issues.map((issue) => {
                return {
                    field: issue.path[issue.path.length - 1],
                    message: issue.message
                };
            });

            const combinedMessage = errors.map(err => err.message).join(", ");

            return res.status(400).json({
                success: false,
                message: combinedMessage
            });
        }
        
        return res.status(400).json({
            success: false,
            message: error.message || "Validation failed"
        });
    }
};
