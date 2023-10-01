import "reflect-metadata";
import express from 'express';
import {testRouter} from "./routers";
import {dataSource} from './db/db.config'
// import {DataSource} from "typeorm";
// import {join} from "path";

const app = express();
const port = 2000;

// const dataSource = new DataSource({
//     type: 'postgres',
//     host: 'localhost',
//     port: 3000,
//     username: 'postgres',
//     password: '03244373938',
//     database: 'test',
//     entities: [join(__dirname, '**', '*.entity.{ts,js}')],
//     synchronize: true,
//     logging: true
// });

dataSource.initialize().then(() => {
   console.log("Database connected!")
}).catch((error) => {
    console.log("Error connecting database!", error);
});

app.use('/', testRouter);

app.listen(port, () => {
    console.log(`Hello, App is running at http://localhost:${port}`);
});
