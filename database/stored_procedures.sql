delimiter //

-- executes a string as a prepared statement
-- eg: call execute_sql('select * from applicant')
-- note: ensure that only sanitized sql is passed to this procedure
drop procedure if exists execute_sql;
create procedure execute_sql(IN input text)
begin
  set @sql = input;
  prepare stmt from @sql;
  execute stmt;
  deallocate prepare stmt;
end; //


-- creates a temporary table from a list of comma-delimited ints
drop procedure if exists create_int_table;
create procedure create_int_table(IN table_name text, IN list text)
begin
  call execute_sql(concat('drop temporary table if exists ', table_name));
  call execute_sql(concat('create temporary table ', table_name, ' (item int)'));
  if nullif(list, '') is not null then
    call execute_sql(concat('insert into ', table_name, ' select ',
      replace(list, ',', ' union select ')));
  end if;
end; //


-- adds an applicant
drop procedure if exists add_applicant;
create procedure add_applicant(
  IN job_category_id int,
  IN status enum ('pending', 'approved'),
  IN first_name varchar(200),
  IN middle_initial varchar(200),
  IN last_name varchar(200),
  IN email varchar(200),
  IN address_1 varchar(200),
  IN address_2 varchar(200),
  IN city varchar(200),
  IN state_id int,
  IN zip varchar(20),
  IN is_foreign boolean,
  IN home_phone varchar(20),
  IN work_phone varchar(20),
  IN fax_phone varchar(20),
  IN citizenship_id int,
  IN undergraduate_gpa decimal(2, 1),
  IN research_interests varchar(2000),
  IN postdoc_experience varchar(2000),
  IN referral_source varchar(2000),
  IN availability_date date,
  IN resume_file varchar(2000),
  IN ip_address varchar(40),
  IN education_level_list varchar(2000),
  IN scientific_focus_list varchar(2000)
)
begin
  declare exit handler for sqlexception, sqlwarning
  begin
    drop temporary table if exists scientific_focus_list;
    drop temporary table if exists education_level_list;
    rollback;
  end;

  start transaction;

  insert into applicant(
    job_category_id,
    status,
    first_name,
    middle_initial,
    last_name,
    email,
    address_1,
    address_2,
    city,
    state_id,
    zip,
    is_foreign,
    home_phone,
    work_phone,
    fax_phone,
    citizenship_id,
    undergraduate_gpa,
    research_interests,
    postdoc_experience,
    referral_source,
    availability_date,
    resume_file,
    ip_address
  ) values (
    job_category_id,
    status,
    first_name,
    middle_initial,
    last_name,
    email,
    address_1,
    address_2,
    city,
    state_id,
    zip,
    is_foreign,
    home_phone,
    work_phone,
    fax_phone,
    citizenship_id,
    undergraduate_gpa,
    research_interests,
    postdoc_experience,
    referral_source,
    availability_date,
    resume_file,
    ip_address
  );

  -- save applicant id
  set @applicant_id = (select last_insert_id());

  -- save scientific focus
  call create_int_table('scientific_focus_list', scientific_focus_list);
  insert into scientific_focus(applicant_id, lu_scientific_focus_id)
    select @applicant_id, item from scientific_focus_list;
  drop temporary table scientific_focus_list;

  -- save education levels
  call create_int_table('education_level_list', education_level_list);
  insert into education_level(applicant_id, lu_education_level_id)
    select @applicant_id, item from education_level_list;
  drop temporary table education_level_list;

  commit;
end; //


-- retrieves a single applicant given an applicant_id
drop procedure if exists get_applicant;
create procedure get_applicant (in applicant_id int)
begin
  select
    a.applicant_id,
    a.job_category_id,
    ljc.name as job_category,
    a.status,
    a.first_name,
    a.middle_initial,
    a.last_name,
    a.email,
    a.address_1,
    a.address_2,
    a.city,
    a.state_id,
    ls.name as state,
    a.zip,
    a.is_foreign,
    a.home_phone,
    a.work_phone,
    a.fax_phone,
    a.citizenship_id,
    lc.name as citizenship,
    a.undergraduate_gpa,
    a.research_interests,
    a.postdoc_experience,
    a.referral_source,
    a.availability_date,
    a.resume_file,
    a.ip_address,
    group_concat(distinct lsf.lu_scientific_focus_id separator ',') as scientific_focus_id,
    group_concat(distinct lsf.name separator ',') as scientific_focus,
    group_concat(distinct lel.lu_education_level_id separator ',') as education_level_id,
    group_concat(distinct lel.name separator ',') as education_level,
    a.created_date,
    a.updated_date
  from applicant a
    left join lu_state ls on a.state_id = ls.lu_state_id
    left join lu_citizenship lc on a.citizenship_id = lc.lu_citizenship_id
    left join lu_job_category ljc on a.job_category_id = ljc.lu_job_category_id
    left join education_level el on a.applicant_id = el.applicant_id
    left join scientific_focus sf on a.applicant_id = sf.applicant_id
    left join lu_education_level lel on el.lu_education_level_id = lel.lu_education_level_id
    left join lu_scientific_focus lsf on sf.lu_scientific_focus_id = lsf.lu_scientific_focus_id
  where
    a.applicant_id = applicant_id
  group by a.applicant_id;
end; //


-- updates an applicant
drop procedure if exists update_applicant;
create procedure update_applicant(
  IN applicant_id int,
  IN job_category_id int,
  IN status enum ('pending', 'approved', 'removed'),
  IN first_name varchar(200),
  IN middle_initial varchar(200),
  IN last_name varchar(200),
  IN email varchar(200),
  IN address_1 varchar(200),
  IN address_2 varchar(200),
  IN city varchar(200),
  IN state_id int,
  IN zip varchar(20),
  IN is_foreign boolean,
  IN home_phone varchar(20),
  IN work_phone varchar(20),
  IN fax_phone varchar(20),
  IN citizenship_id int,
  IN undergraduate_gpa decimal(2, 1),
  IN education_level_list varchar(2000),
  IN scientific_focus_list varchar(2000)
)
begin
  declare exit handler for sqlexception, sqlwarning
  begin
    drop temporary table if exists scientific_focus_list;
    drop temporary table if exists education_level_list;
    rollback;
  end;

  start transaction;

  set @applicant_id = applicant_id;
  set @job_category_id = nullif(job_category_id, '');
  set @status = nullif(status, '');
  set @first_name = nullif(first_name, '');
  set @middle_initial = nullif(middle_initial, '');
  set @last_name = nullif(last_name, '');
  set @email = nullif(email, '');
  set @address_1 = nullif(address_1, '');
  set @address_2 = nullif(address_2, '');
  set @city = nullif(city, '');
  set @state_id = nullif(state_id, '');
  set @zip = nullif(zip, '');
  set @is_foreign = nullif(is_foreign, '');
  set @home_phone = nullif(home_phone, '');
  set @work_phone = nullif(work_phone, '');
  set @fax_phone = nullif(fax_phone, '');
  set @citizenship_id = nullif(citizenship_id, '');
  set @undergraduate_gpa = nullif(undergraduate_gpa, '');

  update applicant a set
    a.job_category_id = @job_category_id,
    a.status = @status,
    a.first_name = @first_name,
    a.middle_initial = @middle_initial,
    a.last_name = @last_name,
    a.email = @email,
    a.address_1 = @address_1,
    a.address_2 = @address_2,
    a.city = @city,
    a.state_id = @state_id,
    a.zip = @zip,
    a.is_foreign = @is_foreign,
    a.home_phone = @home_phone,
    a.work_phone = @work_phone,
    a.fax_phone = @fax_phone,
    a.citizenship_id = @citizenship_id,
    a.undergraduate_gpa = @undergraduate_gpa,
    a.updated_date = now()
  where a.applicant_id = @applicant_id;

  -- save scientific focus areas
  call create_int_table('scientific_focus_list', scientific_focus_list);
  delete s from scientific_focus s where s.applicant_id = @applicant_id;
  insert into scientific_focus(applicant_id, lu_scientific_focus_id)
    select @applicant_id, item from scientific_focus_list;
  drop temporary table scientific_focus_list;

  -- save education levels
  call create_int_table('education_level_list', education_level_list);
  delete e from education_level e where e.applicant_id = @applicant_id;
  insert into education_level(applicant_id, lu_education_level_id)
    select @applicant_id, item from education_level_list;
  drop temporary table education_level_list;

  commit;
end; //


-- searches all applicants
drop procedure if exists search_applicants;
create procedure search_applicants (
  IN job_category_list text,
  IN state_list text,
  IN is_foreign boolean,
  IN education_level_list text,
  IN scientific_focus_list text
) begin
  declare exit handler for sqlexception, sqlwarning
  begin
    drop temporary table if exists job_category_list;
    drop temporary table if exists scientific_focus_list;
    drop temporary table if exists education_level_list;
    drop temporary table if exists state_list;
    rollback;
  end;

  start transaction;

  set @job_category_list = nullif(job_category_list, '');
  set @scientific_focus_list = nullif(scientific_focus_list, '');
  set @education_level_list = nullif(education_level_list, '');
  set @state_list = nullif(state_list, '');
  set @is_foreign = nullif(is_foreign, false);

  call create_int_table('job_category_list', @job_category_list);
  call create_int_table('scientific_focus_list', @scientific_focus_list);
  call create_int_table('education_level_list', @education_level_list);
  call create_int_table('state_list', @state_list);

  select distinct
    a.applicant_id,
    a.job_category_id,
    ljc.name as job_category,
    a.status,
    a.first_name,
    a.middle_initial,
    a.last_name,
    a.email,
    a.address_1,
    a.address_2,
    a.city,
    a.state_id,
    ls.name as state,
    a.zip,
    a.is_foreign,
    a.home_phone,
    a.work_phone,
    a.fax_phone,
    a.citizenship_id,
    lc.name as citizenship,
    a.undergraduate_gpa,
    a.research_interests,
    a.postdoc_experience,
    a.referral_source,
    a.availability_date,
    a.resume_file,
    a.ip_address,
    group_concat(distinct lsf2.name separator ',') as scientific_focus,
    group_concat(distinct lel2.name separator ',') as education_level,
    a.created_date,
    a.updated_date
  from applicant a
    left join lu_state ls on a.state_id = ls.lu_state_id
    left join lu_citizenship lc on a.citizenship_id = lc.lu_citizenship_id
    left join lu_job_category ljc on a.job_category_id = ljc.lu_job_category_id
    left join education_level el on a.applicant_id = el.applicant_id
    left join scientific_focus sf on a.applicant_id = sf.applicant_id
    left join lu_education_level lel on el.lu_education_level_id = lel.lu_education_level_id
    left join lu_scientific_focus lsf on sf.lu_scientific_focus_id = lsf.lu_scientific_focus_id
    -- right join to retrieve all records for an applicant not included in the search criteria
    right join scientific_focus sf2 on sf2.applicant_id = a.applicant_id
    right join education_level el2 on el2.applicant_id = a.applicant_id
    right join lu_scientific_focus lsf2 on lsf2.lu_scientific_focus_id = sf2.lu_scientific_focus_id
    right join lu_education_level lel2 on lel2.lu_education_level_id = el2.lu_education_level_id
  where
    (a.job_category_id in (select item from job_category_list) or @job_category_list is null) and
    (sf.lu_scientific_focus_id in (select item from scientific_focus_list) or @scientific_focus_list is null) and
    (sf2.applicant_id = a.applicant_id) and
    (el.lu_education_level_id in (select item from education_level_list) or @education_level_list is null) and
    (el2.applicant_id = a.applicant_id) and
    (a.state_id in (select item from state_list) or @state_list is null) and
    (a.is_foreign = @is_foreign or @is_foreign is null)
  group by a.applicant_id;

  drop temporary table job_category_list;
  drop temporary table scientific_focus_list;
  drop temporary table education_level_list;
  drop temporary table state_list;

  commit;
end; //

delimiter ;