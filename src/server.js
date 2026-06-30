import { constants} from "./config/constants.js"
import { app } from "./app.js"
import { connectDb } from "./config/dbConfig.js"

connectDb()
    .then(() => {
        app.listen(constants.port, () => {
            console.log(`Server is running on port ${constants.port}`)
        })
    })
    .catch((err) => {
        console.log(`Failed to connect to database`, err)
    })
