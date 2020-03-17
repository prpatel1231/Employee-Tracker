drop database if exists employee_db;
create database employee_db;
use employee_db;

create TABLE department (
    id integer(11) auto_increment not null,
    department varchar(30) not null,
    primary key(id)
);

create TABLE job (
    id integer(11) auto_increment not NULL,
    title varchar(30) not NULL,
    salary decimal(10, 2) not NULL,
    department_id INTEGER(11),
    primary key(id),
    foreign key(department_id) REFERENCES department(id)
);

create TABLE employee (
    id integer(11) auto_increment not NULL,
    first_name varchar(30) not NULL,
    last_name varchar(30) not null,
    job_id integer(11) not null,
    manager_id integer(11),
    primary key(id),
    foreign key(job_id) REFERENCES job(id),
    foreign key(manager_id) references employee(id)
);