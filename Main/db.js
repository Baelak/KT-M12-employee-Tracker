const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: 'You@read3v',
    port: 5432,
});

function runSQLFile(filePath) {
    const sql = fs.readFileSync(filePath).toString();
    return pool.query(sql);
}

// Running schema.sql and seeds.sql
runSQLFile('./db/schema.sql')
    .then(() => runSQLFile('./db/seeds.sql'))
    .then(() => {
        console.log('Database and tables created successfully');
    })
    .catch(err => {
        console.error('Error executing SQL scripts:', err);
    });

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
