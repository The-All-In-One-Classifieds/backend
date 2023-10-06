import "reflect-metadata";
import express from 'express';
import {testRouter} from "./routers";
import {dataSource} from './db/db.config'
// import {DataSource} from "typeorm";
// import {join} from "path";

const app = express();
const port = 2000;
dataSource.initialize().then(() => {
   console.log("Database connected!")
}).catch((error) => {
    console.log("Error connecting database!", error);
});
//sssssssssssssssssssssssss
app.use('/', testRouter);

app.listen(port, () => {
    console.log(`Hello, App is running at http://localhost:${port}`);
});
