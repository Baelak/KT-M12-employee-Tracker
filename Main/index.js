// index.js
const inquirer = require('inquirer');
const db = require('./db');

function mainMenu() {
    inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(({ choice }) => {
        switch (choice) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            default:
                db.pool.end();
                process.exit();
        }
    });
}

function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager_id
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:',
    }).then(({ name }) => {
        db.query('INSERT INTO department (name) VALUES ($1)', [name], (err, res) => {
            if (err) throw err;
            console.log(`Added ${name} to the database`);
            mainMenu();
        });
    });
}

function addRole() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const departments = res.rows.map(({ id, name }) => ({ name: name, value: id }));
        
        inquirer.prompt([
            { type: 'input', name: 'title', message: 'Enter the role title:' },
            { type: 'input', name: 'salary', message: 'Enter the role salary:' },
            { type: 'list', name: 'department_id', message: 'Select the department:', choices: departments }
        ]).then(({ title, salary, department_id }) => {
            db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id], (err, res) => {
                if (err) throw err;
                console.log(`Added ${title} to the database`);
                mainMenu();
            });
        });
    });
}

function addEmployee() {
    db.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));

        db.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            const managers = res.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
            managers.push({ name: 'None', value: null });

            inquirer.prompt([
                { type: 'input', name: 'first_name', message: 'Enter the employee\'s first name:' },
                { type: 'input', name: 'last_name', message: 'Enter the employee\'s last name:' },
                { type: 'list', name: 'role_id', message: 'Select the employee\'s role:', choices: roles },
                { type: 'list', name: 'manager_id', message: 'Select the employee\'s manager:', choices: managers }
            ]).then(({ first_name, last_name, role_id, manager_id }) => {
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
                [first_name, last_name, role_id, manager_id], (err, res) => {
                    if (err) throw err;
                    console.log(`Added ${first_name} ${last_name} to the database`);
                    mainMenu();
                });
            });
        });
    });
}

function updateEmployeeRole() {
    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        const employees = res.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

        db.query('SELECT * FROM role', (err, res) => {
            if (err) throw err;
            const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                { type: 'list', name: 'employee_id', message: 'Select an employee to update:', choices: employees },
                { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roles }
            ]).then(({ employee_id, role_id }) => {
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id], (err, res) => {
                    if (err) throw err;
                    console.log('Employee role updated');
                    mainMenu();
                });
            });
        });
    });
}

// Start the application
mainMenu();
