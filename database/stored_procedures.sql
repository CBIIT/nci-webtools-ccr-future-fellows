
create procedure execute_sql(input text)
begin
 set @sql = input
 prepare stmt from @sql
 execute stmt
 deallocate prepare stmt
end;

create procedure insert_delimited_values
(
  strlist text,
  delimiter text,
  table_name text
)
begin
  call execute_sql(concat(
    'insert into ', table_name, ' select ',
    replace(strlist, delimiter, ' union select ')))
end;

create procedure add_applicant
(
	job_category_id int,
	status enum('PENDING', 'APPROVED'),
	first_name varchar(200),
	middle_initial varchar(200),
	last_name varchar(200),
	email varchar(200),
	address1 varchar(200),
	address2 varchar(200),
	city varchar(200),
	state char(2),
	zip varchar(20),
	home_phone varchar(20),
	work_phone varchar(20),
	fax_phone varchar(20),
	is_foreign boolean,
	citizenship_id int,
	undergraduate_gpa decimal(2,1),
	research_interests varchar(2000),
	postdoc_experience varchar(2000),
	referral_source varchar(2000),
	availability_date date,
	resume_filepath varchar(2000),
  education_level varchar(2000), -- comma-separated list
  scientific_focus varchar(2000) -- comma-separated list
)
begin
  insert into applicant(
    job_category_id,
    status,
    first_name,
    middle_initial,
    last_name,
    email,
    address1,
    address2,
    city,
    state,
    zip,
    home_phone,
    work_phone,
    fax_phone,
    is_foreign,
    citizenship_id,
    undergraduate_gpa,
    research_interests,
    postdoc_experience,
    referral_source,
    availability_date,
    resume_filepath
  ) values (
    job_category_id,
    status,
    first_name,
    middle_initial,
    last_name,
    email,
    address1,
    address2,
    city,
    state,
    zip,
    home_phone,
    work_phone,
    fax_phone,
    is_foreign,
    citizenship_id,
    undergraduate_gpa,
    research_interests,
    postdoc_experience,
    referral_source,
    availability_date,
    resume_filepath
  );

  -- save applicant id
  set @applicant_id = (select last_insert_id());

  -- save scientific focus areas
  create temporary table scientific_focus_list(item int);
  call insert_delimited_values(scientific_focus, ',', 'scientific_focus_list');
  insert into scientific_focus (applicant_id, lu_scientific_focus_id)
    select @applicant_id, item from scientific_focus_list;
  drop temporary table scientific_focus_list;

  -- save education levels
  create temporary table education_level_list(item int);
  call insert_delimited_values(education_level, ',', 'education_level_list');
  insert into education_level (applicant_id, lu_education_level_id)
    select @applicant_id, item from education_level_list;
  drop temporary table education_level_list;
end;
