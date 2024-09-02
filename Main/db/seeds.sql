-- seeds.sql

INSERT INTO department (name) VALUES 
('Engineering'),
('Finance'),
('Legal'),
('Sales');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Accountant', 70000, 2),
('Lawyer', 90000, 3),
('Salesperson', 60000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Abebe', 'Bekila', 1, NULL),
('Homer', 'Simpson', 2, NULL),
('Stan', 'Smith', 3, NULL),
('Johnny', 'Lawrence', 4, NULL);
