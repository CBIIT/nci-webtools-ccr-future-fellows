delimiter //

-- executes a string as a prepared statement
-- eg: call execute_sql('select * from applicant')
drop procedure if exists execute_sql;
create procedure execute_sql(IN input text)
begin
  set @sql = input;
  prepare stmt from @sql;
  execute stmt;
  deallocate prepare stmt;
end; //

-- inserts delimited values into a table
-- eg: call insert_delimited_values('1,2,3', ',', 'temporary_table')
drop procedure if exists insert_delimited_values;
create procedure insert_delimited_values(
  IN strlist text,
  IN delimiter text,
  IN table_name text
)
begin
  call execute_sql(concat(
    'insert into ', table_name, ' select "',
    replace(strlist, delimiter, '" union select "'),
    '"'));
end; //

drop procedure create_int_table;
create procedure int_table(IN table_name text, IN list text)
begin
  call execute_sql(concat('drop temporary table if exists ', table_name));
  call execute_sql(concat('create temporary table ', table_name, ' (item int)'));
  call insert_delimited_values(list, ',', table_name);
end;

-- adds an applicant
drop procedure if exists add_applicant;
create procedure add_applicant(
  IN job_category_id int,
  IN status enum ('PENDING', 'APPROVED'),
  IN first_name varchar(200),
  IN middle_initial varchar(200),
  IN last_name varchar(200),
  IN email varchar(200),
  IN address_1 varchar(200),
  IN address_2 varchar(200),
  IN city varchar(200),
  IN state_id int,
  IN zip varchar(20),
  IN home_phone varchar(20),
  IN work_phone varchar(20),
  IN fax_phone varchar(20),
  IN is_foreign boolean,
  IN citizenship_id int,
  IN undergraduate_gpa decimal(2, 1),
  IN research_interests varchar(2000),
  IN postdoc_experience varchar(2000),
  IN referral_source varchar(2000),
  IN availability_date date,
  IN resume_filepath varchar(2000),
  IN education_level varchar(2000),
  IN scientific_focus varchar(2000)
)
begin

  declare exit handler for sqlexception, sqlwarning
  begin
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
    address_1,
    address_2,
    city,
    state_id,
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

  -- save scientific focus
  if (nullif(scientific_focus, '') is not null) then
    call create_int_table('scientific_focus_list', scientific_focus);
    insert into scientific_focus(applicant_id, lu_scientific_focus_id) select @applicant_id, item from scientific_focus_list;
    drop temporary table scientific_focus_list;
  end if;

  -- save education levels
  if (nullif(education_level, '') is not null) then
    call create_int_table('education_level_list', education_level);
    insert into education_level(applicant_id, lu_education_level_id) select @applicant_id, item from education_level_list;
    drop temporary table education_level_list;
  end if;

  commit;

end; //


create procedure update_applicant(
  IN applicant_id int,
  IN job_category_id int,
  IN status enum ('PENDING', 'APPROVED', 'ON_HOLD'),
  IN first_name varchar(200),
  IN middle_initial char,
  IN last_name varchar(200),
  IN email varchar(200),
  IN address_1 varchar(200),
  IN address_2 varchar(200),
  IN city varchar(200),
  IN state char(2),
  IN zip varchar(20),
  IN home_phone varchar(20),
  IN work_phone varchar(20),
  IN fax_phone varchar(20),
  IN is_foreign tinyint(1),
  IN citizenship_id int,
  IN undergraduate_gpa decimal(2, 1),
  IN education_level varchar(2000),
  IN scientific_focus varchar(2000)
)
begin

  declare exit handler for sqlexception, sqlwarning
  begin
    rollback;
  end;

  start transaction;

  update applicant a set
    a.job_category_id = job_category_id,
    a.status = status,
    a.first_name = first_name,
    a.middle_initial = middle_initial,
    a.last_name = last_name,
    a.email = email,
    a.address_1 = address_1,
    a.address_2 = address_2,
    a.city = city,
    a.state = state,
    a.zip = zip,
    a.home_phone = home_phone,
    a.work_phone = work_phone,
    a.fax_phone = fax_phone,
    a.is_foreign = is_foreign,
    a.citizenship_id = citizenship_id,
    a.undergraduate_gpa = undergraduate_gpa
  where a.applicant_id = applicant_id

  -- save scientific focus
  if nullif(scientific_focus, '') is not null then
    drop temporary table if exists scientific_focus_list;
    create temporary table scientific_focus_list(item int);

    call insert_delimited_values(scientific_focus, ',', 'scientific_focus_list');
    delete from scientific_focus s where s.applicant_id in applicant_id;
    insert into scientific_focus(applicant_id, lu_scientific_focus_id) select @applicant_id, item from scientific_focus_list;
    drop temporary table scientific_focus_list;
  end if;

  -- save education levels
  if nullif(education_level, '') is not null then
    drop temporary table if exists education_level_list;
    create temporary table education_level_list(item int);
    call insert_delimited_values(education_level, ',', 'education_level_list');
    delete from education_level e where e.applicant_id = applicant_id;
    insert into education_level(applicant_id, lu_education_level_id) select @applicant_id, item from education_level_list;
    drop temporary table education_level_list;
  end if;

  commit;

end; //

create procedure search_applicants (
  IN job_category text,
  IN state text,
  IN is_foreign tinyint(1),
  IN education_level text,
  IN scientific_focus text
) begin

  drop temporary table if exists job_category_list;
  drop temporary table if exists scientific_focus_list;
  drop temporary table if exists education_level_list;
  drop temporary table if exists state_list;

  create temporary table job_category_list(item text);
  create temporary table scientific_focus_list(item int);
  create temporary table education_level_list(item int);
  create temporary table state_list(item text);

  -- save job categories
  if (ifnull(job_category, '') != '') then
    call insert_delimited_values(job_category, ',', 'job_category_list');
  end if;

  -- save scientific focus
  if (ifnull(scientific_focus, '') != '') then
    call insert_delimited_values(scientific_focus, ',', 'scientific_focus_list');
  end if;

  -- save education levels
  if (ifnull(education_level , '') != '') then
    call insert_delimited_values(education_level, ',', 'education_level_list');
  end if;

  -- save states
  if (ifnull(state, '') != '') then
    call insert_delimited_values(state, ',', 'state_list');
  end if;

  select distinct
    a.applicant_id,
    concat(last_name, ', ', first_name) as name,
    a.created_date,
    state,
    lj.name as job_category,
    group_concat(distinct ls.name separator ',') as scientific_focus,
    lc.name as citizenship,
    group_concat(DISTINCT le.name separator ',') as education_level,
    undergraduate_gpa
  from applicant a
    join education_level el on a.applicant_id = el.applicant_id
    join scientific_focus sf on a.applicant_id = sf.applicant_id
    join lu_education_level le on el.lu_education_level_id = le.lu_education_level_id
    join lu_citizenship lc on a.citizenship_id = lc.lu_citizenship_id
    join lu_job_category lj on a.job_category_id = lj.lu_job_category_id
    join lu_scientific_focus ls on sf.lu_scientific_focus_id = ls.lu_scientific_focus_id
  where
    a.job_category_id = 1 or
    sf.scientific_focus_id in (select item from scientific_focus_list) or
    el.education_level_id in (select item from education_level_list) or
    a.state in (select item from state_list) or
    is_foreign = true
  group by a.applicant_id;

  drop temporary table job_category_list;
  drop temporary table scientific_focus_list;
  drop temporary table education_level_list;
  drop temporary table state_list;
end; //

delimiter ;