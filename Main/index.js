const inquirer = require('inquirer');
const db = require('./db');

async function mainMenu() {
    try {
        const { choice } = await inquirer.prompt({
            type: 'list',
            name: 'choice',
            message: 'EMPLOYEE 📎 TRACKER\nWhat would you like to do?',
            choices: [
                '🔍 View all Departments',
                '🔍 View all Roles',
                '🔍 View all Employees',

                '➕ Add a Department',
                '➕ Add a Role',
                '➕ Add an Employee',

                '🔄️ Update an Employee Role',
                
                '🚪 Exit 🚪'
            ]
        });

        switch (choice) {
            case '🔍 View all Departments':
                await viewAllDepartments();
                break;
            case '🔍 View all Roles':
                await viewAllRoles();
                break;
            case '🔍 View all Employees':
                await viewAllEmployees();
                break;
            case '➕ Add a Department':
                await addDepartment();
                break;
            case '➕ Add a Role':
                await addRole();
                break;
            case '➕ Add an Employee':
                await addEmployee();
                break;
            case '🔄️ Update an Employee Role':
                await updateEmployeeRole();
                break;
            default:
                db.pool.end();
                process.exit();
        }
    } catch (err) {
        console.error("An error occurred:", err.message);
        mainMenu(); // Return to the main menu after an error
    }
}

async function viewAllDepartments() {
    try {
        const res = await db.query('SELECT * FROM department');
        console.table(res.rows);
        mainMenu();
    } catch (err) {
        console.error("Error viewing departments:", err.message);
        mainMenu();
    }
}

async function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    try {
        const res = await db.query(query);
        console.table(res.rows);
        mainMenu();
    } catch (err) {
        console.error("Error viewing roles:", err.message);
        mainMenu();
    }
}

async function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        JOIN role ON employee.role_id = role.id
        JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    `;
    try {
        const res = await db.query(query);
        console.table(res.rows);
        mainMenu();
    } catch (err) {
        console.error("Error viewing employees:", err.message);
        mainMenu();
    }
}

async function addDepartment() {
    try {
        const { name } = await inquirer.prompt({
            type: 'input',
            name: 'name',
            message: 'Enter the name of the department:',
        });

        await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
        console.log(`Added ${name} to the database`);
        mainMenu();
    } catch (err) {
        console.error("Error adding department:", err.message);
        mainMenu();
    }
}

async function addRole() {
    try {
        const res = await db.query('SELECT * FROM department');
        const departments = res.rows.map(({ id, name }) => ({ name: name, value: id }));

        const { title, salary, department_id } = await inquirer.prompt([
            { type: 'input', name: 'title', message: 'Enter the role title:' },
            { type: 'input', name: 'salary', message: 'Enter the role salary:' },
            { type: 'list', name: 'department_id', message: 'Select the department:', choices: departments }
        ]);

        await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
        console.log(`Added ${title} to the database`);
        mainMenu();
    } catch (err) {
        console.error("Error adding role:", err.message);
        mainMenu();
    }
}

async function addEmployee() {
    try {
        const resRoles = await db.query('SELECT * FROM role');
        const roles = resRoles.rows.map(({ id, title }) => ({ name: title, value: id }));

        const resManagers = await db.query('SELECT * FROM employee');
        const managers = resManagers.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));
        managers.push({ name: 'None', value: null });

        const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
            { type: 'input', name: 'first_name', message: 'Enter the employee\'s first name:' },
            { type: 'input', name: 'last_name', message: 'Enter the employee\'s last name:' },
            { type: 'list', name: 'role_id', message: 'Select the employee\'s role:', choices: roles },
            { type: 'list', name: 'manager_id', message: 'Select the employee\'s manager:', choices: managers }
        ]);

        await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
        [first_name, last_name, role_id, manager_id]);

        console.log(`Added ${first_name} ${last_name} to the database`);
        mainMenu();
    } catch (err) {
        console.error("Error adding employee:", err.message);
        mainMenu();
    }
}

async function updateEmployeeRole() {
    try {
        const resEmployees = await db.query('SELECT * FROM employee');
        const employees = resEmployees.rows.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

        const resRoles = await db.query('SELECT * FROM role');
        const roles = resRoles.rows.map(({ id, title }) => ({ name: title, value: id }));

        const { employee_id, role_id } = await inquirer.prompt([
            { type: 'list', name: 'employee_id', message: 'Select an employee to update:', choices: employees },
            { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roles }
        ]);

        await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
        console.log('Employee role updated');
        mainMenu();
    } catch (err) {
        console.error("Error updating employee role:", err.message);
        mainMenu();
    }
}

// Start the application
mainMenu();
