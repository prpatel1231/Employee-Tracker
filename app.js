const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

// create the connection
var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: "root",
    password: "password",
    database: "employeetracker_db"
});

// connect to the server and database
connection.connect(function (err) {
    if (err) throw err;
    start();
});

// start function prompt user for actions
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Department", "Add Job", "Add Employee", "Update Employee's Job", "View Departments, Jobs, or Employees", "Exit"]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Add Department":
                    addDept();
                    break;
                case "Add Job":
                    addJob();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee's Job":
                    updateRole();
                    break;
                case "View Departments, Jobs, or Employees":
                    viewData();
                    break;
                case "Exit":
                    connection.end();
                    break;
                default:
                    console.log("\n \n Something went wrong");
                    connection.end();
            }
        });
}

// add a new department
function addDept() {
    // show existing departments 
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.log("\n \n current departments: ")
        console.table(results);
        // Ask for a new department
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "Enter the name of the new department:"
            }
        ])
            .then(function (answer) {
                // Add the new department
                connection.query("INSERT INTO department SET ?",
                    { department: answer.department }
                    ,
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New department added:" + answer.department);
                        // restart
                        start();
                    }
                );
            })
    });
}

// add a new jole
function addJob() {
    // show the existing departments with id's
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.log("\n \n These are the current departments:")
        console.table(results)
        // prompt for a new job title, salary, and dept id
        inquirer
            .prompt([
                {
                    name: "job",
                    type: "input",
                    message: "Enter the name of the new job:"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter the salary"
                },
                {
                    name: "dept",
                    type: "input",
                    message: "Enter the id of the role's department (use the table above):"
                }
            ])
            .then(function (answer) {
                // Add the new department
                connection.query("INSERT INTO role SET ?", {
                    title: answer.job,
                    salary: answer.salary,
                    department_id: answer.dept
                },
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New job added: " + answer.job);
                        // restart
                        start();
                    }
                );
            })
    });
}

// add a new employee
function addEmployee() {
    // show the existing jobs and id's
    connection.query("SELECT * FROM job", function (err, results) {
        if (err) throw err;
        console.log("\n \n These are the current jobs: ")
        console.table(results)
        // prompt for a new employee name, job and manager id
        inquirer
            .prompt([
                {
                    name: "first",
                    type: "input",
                    message: "Enter the employee's first name"
                },
                {
                    name: "last",
                    type: "input",
                    message: "Enter the employee's last name"
                },
                {
                    name: "role",
                    type: "input",
                    message: "Enter the id of the employee's jobs (use the table above):"
                },
                {
                    name: "manager",
                    type: "input",
                    message: "Enter the employee's manager ID"
                }
            ])
            .then(function (answer) {
                // Set the manager ID to null
                var managerID = null
                // If the manager ID answer is a number, change it to that
                if (isNaN(answer.manager) === false) {
                    managerID = answer.manager
                }
                // Add the employee
                connection.query("INSERT INTO employee SET ?", {
                    first_name: answer.first,
                    last_name: answer.last,
                    job_id: job.role,
                    manager_id: managerID
                },
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New employee added:" + answer.first + " " + answer.last);
                        // re-start the application
                        start();
                    }
                );
            })
    });
}

//  update jobs
function updateJob() {
    // query the database for all employees
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        // loop through the employees and ask the user which they want to update
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].first_name + " " + results[i].last_name);
                        }
                        return choiceArray;
                    },
                    message: "Whose role would you like to update?"
                },
                // Ask for a new title and salary
                {
                    name: "title",
                    type: "input",
                    message: "Enter the employee's new title:"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter the employee's new salary:"
                }])
            .then(function (answer) {
                // get the information of the chosen employee
                var chosenEmployee;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].first_name + " " + results[i].last_name === answer.employee) {
                        chosenEmployee = results[i];
                    }
                };
                // Make the salary into an integer
                var newSalary = parseInt(answer.salary);
                // Update that role with the newly entered information
                connection.query(
                    "UPDATE job INNER JOIN employee ON employee.role_id = role.id " +
                    "SET ?, ? WHERE ?",
                    [
                        {
                            salary: newSalary
                        },
                        {
                            title: answer.title
                        },
                        {
                            last_name: chosenEmployee.last_name
                        }
                    ],
                    function (error) {
                        if (error) console.log(error);
                        console.log("\n \n Updated " + chosenEmployee.first_name + " " + chosenEmployee.last_name);
                        // re-start the application
                        start();
                    });
            });
    });
}

// view individual tables
function tableInfo(tableToView) {
    connection.query("SELECT * FROM " + tableToView, function (err, results) {
        if (err) throw err;
        console.log("\n \nThese are the current " + tableToView + "s: ")
        console.table(results);
        start();
    })
}

// view all info from 3 tables
function allInfo() {
    // Show all current information joined in 1 table
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, ' +
        'job.title, job.salary, job.id, department.department, department.id ' +
        'FROM ((employee INNER JOIN job ON employee.job_id = job.id) ' +
        'INNER JOIN department ON job.department_id = department.id) ORDER BY employee.id ASC', function (err, results) {
            if (err) throw err;
            console.log("\n \n This is all the current information: ")
            console.table(results);
            start();
        })
}

// function to view tables
function viewData() {
    // Ask which table the user wants to see
    inquirer.prompt({
        name: "table",
        type: "list",
        message: "Which data would you like to see?",
        choices: ["Departments", "Jobs", "Employees", "Everything", "Exit"]
    })
        // Switch uses the helper functions and enters in the answer to return the table the user wants
        .then(function (answer) {
            switch (answer.table) {
                case "Departments":
                    tableInfo("department");
                    break;
                case "Jobs":
                    tableInfo("job");
                    break;
                case "Employees":
                    tableInfo("employee");
                    break;
                case "Everything":
                    allInfo();
                    break;
                case "Exit":
                    connection.end();
                    break;
                default:
                    console.log("\n \n Something went wrong, try again");
                    connection.end();
            }
        });
}