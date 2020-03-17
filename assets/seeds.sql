INSERT INTO department (department)
VALUES ("Management"), ("Engineering");

INSERT INTO job (title, salary, department_id)
VALUES ("Manager", 225000, "1"), ("Engineer", 92000, "2"), ("Engineer", 105000, "2");

INSERT INTO employee (first_name, last_name, job_id, manager_id)
VALUES ("Parth", "Patel", "1", "1"), ("Rob", "Nashr", "2", null), ("Justin", "Gross", "3", null)