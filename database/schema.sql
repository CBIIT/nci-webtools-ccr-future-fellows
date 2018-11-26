create table lu_citizenship
(
    lu_citizenship_id integer primary key auto_increment,
    name varchar(200)
);

create table lu_education_level
(
    lu_education_level_id integer primary key auto_increment,
    name varchar(20)
);

create table lu_job_category
(
    lu_job_category_id integer primary key auto_increment,
    name varchar(200)
);

create table lu_scientific_focus
(
    lu_scientific_focus_id integer primary key auto_increment,
    name varchar(200)
);

create table lu_state
(
    lu_state_id integer primary key auto_increment,
    short_name nchar(2) unique
);

create table applicant
(
    applicant_id integer primary key auto_increment,
    job_category_id integer,
    first_name varchar(200),
    middle_initial nchar(1),
    last_name varchar(200),
    email varchar(200),
    address1 varchar(200),
    address2 varchar(200),
    city varchar(200),
    state nchar(2),
    zip varchar(20),
    home_phone varchar(20),
    work_phone varchar(20),
    fax_phone varchar(20),
    citizenship_id integer,
    undergraduate_gpa decimal(2,1),
    research_interests varchar(2000),
    postdoc_experience varchar(2000),
    referral_source varchar(2000),
    availability_date date,
    resume_filepath varchar(2000),
    status enum('PENDING', 'APPROVED', 'ON_HOLD'),
    is_foreign boolean,
    created_date datetime default NOW(),
    updated_date datetime default NOW(),
    check (undergraduate_gpa >= 0 and undergraduate_gpa <= 4),
    foreign key (job_category_id) references  lu_job_category(lu_job_category_id),
    foreign key (state) references lu_state(short_name),
    foreign key (citizenship_id) references lu_citizenship(lu_citizenship_id)
);

create table education_level
(
    education_level_id integer primary key auto_increment,
    applicant_id integer,
    lu_education_level_id integer,
    created_date datetime default NOW(),
    updated_date datetime default NOW(),
    foreign key (applicant_id) references applicant(applicant_id),
    foreign key (lu_education_level_id) references lu_education_level(lu_education_level_id)
);

create table scientific_focus
(
    scientific_focus_id integer primary key auto_increment,
    applicant_id integer,
    lu_scientific_focus_id integer,
    created_date datetime default NOW(),
    updated_date datetime default NOW(),
    foreign key (applicant_id) references applicant(applicant_id),
    foreign key (lu_scientific_focus_id) references lu_scientific_focus(lu_scientific_focus_id)
);

create table user_track
(
    user_track_id integer primary key auto_increment,
    username varchar(200),
    first_name varchar(200),
    last_name varchar(200),
    login_date datetime,
    created_date datetime default NOW(),
    updated_date datetime default NOW()
);
