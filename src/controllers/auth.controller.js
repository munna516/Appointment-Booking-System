export const authController = {
    login: async (req, res) => {
        try {

            return res.json({
                message: "Login Success",
                timestamp: new Date().toISOString()
            })

        } catch (error) {

        }
    }
}
