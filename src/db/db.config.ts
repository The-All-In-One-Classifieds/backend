import {DataSource} from "typeorm";
import {join} from "path";

export const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 3000,
    username: 'postgres',
    password: '03244373938',
    database: 'test',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: true,
    logging: true
});
