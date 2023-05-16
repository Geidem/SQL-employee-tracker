const inquirer = require('inquirer');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_tracker_db'
    },
    console.log(`Connected to the employee_tracker_db database.`)
);

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    start();
}
);

function start() {
    inquirer.prompt({
        type: 'list',
        name: 'start',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update an Employee Role',
            'Exit'
        ]
    })
        .then(answer => {
            switch (answer.start) {
                case 'View All Departments':
                    viewDepartments();
                    break;
                case 'View All Roles':
                    viewRoles();
                    break;
                case 'View All Employees':
                    viewEmployees();
                    break;
                case 'Add a Department':
                    addDepartment();
                    break;
                case 'Add a Role':
                    addRole();
                    break;
                case 'Add an Employee':
                    addEmployee();
                    break;
                case 'Update an Employee Role':
                    updateEmployeeRole();
                    break;
                case 'Exit':
                    db.end();
                    break;
            }
        })
}

// Function to view all departments
function viewDepartments() {
    const sql = `SELECT * FROM department`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all roles
function viewRoles() {
    const sql = `SELECT * FROM role`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to view all employees
function viewEmployees() {
    const sql = `SELECT * FROM employee`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

// Function to add a department
function addDepartment() {
    inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is the name of the department you would like to add?'
    })
        .then(answer => {
            console.log(answer.name)
            const sql = `INSERT INTO department (department_name) VALUES ("${answer.name}")`;

            db.query(sql, (err, res) => {
                if (err) throw err;
                console.log(`Added department ${answer.name} to the database.`);
                start();
                console.log(answer.name);
            });
        });
}

// Function to add a role
function addRole() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        const departmentchoices = res.map((department) => {
            return {
               name: department.department_name,
               value: department.department_id
            };
        });
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the name of the role you would like to add?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Salary for this role:'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does this role belong to?',
                choices: departmentchoices,
            },
        ])
            .then(answer => {
                const departmentId = answer.department;
                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                db.query(sql, [answer.title, answer.salary, departmentId],
                 (err, res) => {
                    if (err) throw err;
                    console.log(`Added role ${answer.title} to the database.`);
                    start();
                });
            });
    });
}


// Function to add an employee

function addEmployee() {
    db.query(`SELECT * FROM role`, (err, res) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'What is the first name of the employee you would like to add?'
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'What is the last name of the employee you would like to add?'
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is the role of the employee you would like to add?',
                choices: res.map(role => role.title)
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Who is the manager of the employee you would like to add?',
                choices: res.map(manager => manager.title)
            }
        ])
            .then(answer => {
                const role = res.find(role => role.title === answer.role);
                const manager = res.find(manager => manager.title === answer.manager);
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                const params = [answer.first_name, answer.last_name, role.id, manager.id];

                db.query(sql, params, (err, res) => {
                    if (err) throw err;
                    console.log(`Added employee ${answer.first_name} ${answer.last_name} to the database.`);
                    start();
                });
            });
    });
}

// Function to update an employee role
function updateEmployeeRole() {
    const sql = `SELECT * FROM employee`;
    const sqlRoles = `SELECT * FROM role`;

    db.query(sql, (err, res) => {
        if (err) throw err;
        db.query(sqlRoles, (err, resRoles) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: 'Which employee would you like to update?',
                    choices: res.map(employee => employee.first_name)
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the new role of the employee?',
                    choices: resRoles.map(role => role.title)
                }
            ])
                .then(answer => {
                    const employee = res.find(employee => employee.first_name === answer.employee);
                    const role = resRoles.find(role => role.title === answer.role);
                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    const params = [role.id, employee.id];

                    db.query(sql, params, (err, res) => {
                        if (err) throw err;
                        console.log(`Updated employee ${answer.employee} to ${answer.role}.`);
                        start();
                    });
                });
        });
    });
}

          



            