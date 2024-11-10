import { Options, Sequelize } from "sequelize";

import config from "../server/config";

const user = config.DB_USERNAME || 'fqzyzgovpsyizh';
const password = config.DB_PASSWORD || '453d5cc51dbd6425b329e2c9366d29d4cc5641e93aac4be42d67e5e3eedcf973';
const host = config.DB_HOST || 'ec2-35-169-9-79.compute-1.amazonaws.com';
const port = config.DB_PORT || 5432;
const database = config.DB_DATABASE || 'dc1jv30sgre0s8';
const typeDatabase = config.DB_CONNECTION || 'postgres';

// const url = `${typeDatabase}://${user}:${password}@${host}:${port}/${database}`;
// const url = config.DATABASE_URL || "";

// console.log(url);

// const options: Options = {
//     dialect: 'postgres', // 'mysql' | 'sqlite' | 'postgres' | 'mariadb' | 'mssql'
//     logging: false, // false
//     dialectOptions: {
//         ssl: {
//             rejectUnauthorized: false
//         }
//     }
// };

// const sequelizeConnection = new Sequelize(url, options);
// export default sequelizeConnection;

// import { Sequelize } from "sequelize";


// //     PARA EL LOCALHOST
const db = new Sequelize('content-create-db', 'postgres', 'password', {
    host: 'localhost',
    dialect: "postgres",
})

export default db;