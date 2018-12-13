

-- lookup table for citizenship types
-- eg: United States, Foreign National, etc
drop table if exists lu_citizenship;
create table lu_citizenship
(
    lu_citizenship_id integer primary key auto_increment,
    name varchar(200) not null
);

-- lookup table for educational degrees
-- eg: DDS, DO, DSc, etc
drop table if exists lu_education_level;
create table lu_education_level
(
    lu_education_level_id integer primary key auto_increment,
    name varchar(20) not null
);

-- lookup table for job categories
-- eg: Postdoctoral Fellowship, Foreign Visiting Fellow, etc
drop table if exists lu_job_category;
create table lu_job_category
(
    lu_job_category_id integer primary key auto_increment,
    name varchar(200) not null
);

-- lookup table for scientific focus areas
-- eg: Biomedical Engineering, Cancer Biology, etc
drop table if exists lu_scientific_focus;
create table lu_scientific_focus
(
    lu_scientific_focus_id integer primary key auto_increment,
    name varchar(200) not null
);

-- look table for U.S. states
-- eg: AK, AL, AR, etc
drop table if exists lu_state;
create table lu_state
(
    lu_state_id integer primary key auto_increment,
    short_name nchar(2) unique not null
);

-- main applicants table
-- contains single-field information about an applicant
-- one-to-many relationship with education_level and scientific_focus
drop table if exists applicant;
create table applicant
(
    applicant_id integer primary key auto_increment,
    status enum('PENDING', 'APPROVED', 'REMOVED'),
    job_category_id integer not null,
    first_name varchar(200) not null,
    middle_initial varchar(200),
    last_name varchar(200) not null,
    email varchar(200) not null,
    address_1 varchar(200) not null,
    address_2 varchar(200),
    city varchar(200) not null,
    state_id integer,
    zip varchar(20),
    is_foreign boolean,
    home_phone varchar(20) not null,
    work_phone varchar(20),
    fax_phone varchar(20),
    citizenship_id integer not null,
    undergraduate_gpa decimal(2,1),
    research_interests varchar(2000) not null,
    postdoc_experience varchar(2000) not null,
    referral_source varchar(2000) not null,
    availability_date date not null,
    resume_filepath varchar(2000) not null,
    created_date datetime default now(),
    updated_date datetime default now(),
    check (undergraduate_gpa >= 0 and undergraduate_gpa <= 4),
    foreign key (job_category_id) references  lu_job_category(lu_job_category_id),
    foreign key (state_id) references lu_state(lu_state_id),
    foreign key (citizenship_id) references lu_citizenship(lu_citizenship_id)
);

-- applicant education levels (many-to-one with applicant)
drop table if exists education_level;
create table education_level
(
    applicant_id integer not null,
    lu_education_level_id integer not null,
    created_date datetime default now(),
    updated_date datetime default now(),
    primary key (applicant_id, lu_education_level_id),
    foreign key (applicant_id) references applicant(applicant_id),
    foreign key (lu_education_level_id) references lu_education_level(lu_education_level_id)
);

-- applicant scientific focus areas (many-to-one with applicant)
drop table if exists scientific_focus;
create table scientific_focus
(
    applicant_id integer not null,
    lu_scientific_focus_id integer not null,
    created_date datetime default now(),
    updated_date datetime default now(),
    primary key (applicant_id, lu_scientific_focus_id),
    foreign key (applicant_id) references applicant(applicant_id),
    foreign key (lu_scientific_focus_id) references lu_scientific_focus(lu_scientific_focus_id)
);

-- tracks user actions on applicants
drop table if exists user_track;
create table user_track
(
    user_track_id integer primary key auto_increment,
    username varchar(200) not null,
    first_name varchar(200),
    last_name varchar(200),
    action enum (
        'Logged In',
        'Viewed Details',
        'Viewed Resume',
        'Downloaded Files',
        'Emailed Files',
        'Removed Applicant',
        'Approved Applicant',
        'Searched Applicants'),
    target text null comment 'email, applicant name, etc.',
    created_date datetime default now(),
    updated_date datetime default now(),
    foreign key (applicant_id) references applicant(applicant_id),
);