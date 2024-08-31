const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: 'You@read3v',
    port: 5432,
});

const sql = fs.readFileSync('your-script.sql').toString();

pool.query(sql, (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Database and tables created successfully');
    }
    pool.end();
});

