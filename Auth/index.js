import express from "express"
import 'dotenv/config'
import authRoutes from "./routing/authRoutes.js"
import cors from 'cors'
import connectDB from "./dbConfig/index.js"
import ErrorMiddleware from "./middleware/ErrorMiddleware.js"
import { rabbitMQ } from "./services/rabbitMQ.js"


const app = express()
const port = process.env.PORT
app.use(express.json());

connectDB()
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/api/v1/auth', authRoutes)

app.listen(port, () => {
    console.log(`Server is running port ${port}`)
})
app.use(ErrorMiddleware);