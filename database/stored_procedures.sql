create procedure execute_sql(IN input text)
begin
 set @sql = input;
 prepare stmt from @sql;
 execute stmt;
 deallocate prepare stmt;
end;

create procedure insert_delimited_values(
  IN strlist text,
  IN delimiter text,
  IN table_name text
)
begin
  call execute_sql(concat(
    'insert into ', table_name, ' select ',
    replace(strlist, delimiter, ' union select ')));
end;

create procedure add_applicant(
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
    address_1,
    address_2,
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

  -- save scientific focus
  if (scientific_focus is not null) then
    drop temporary table if exists scientific_focus_list;
    create temporary table scientific_focus_list(item int);
    call insert_delimited_values(scientific_focus, ',', 'scientific_focus_list');
    insert into scientific_focus(applicant_id, lu_scientific_focus_id) select @applicant_id, item from scientific_focus_list;
    drop temporary table scientific_focus_list;
  end if;

  -- save education levels
  if (education_level is not null) then
    drop temporary table if exists education_level_list;
    create temporary table education_level_list(item int);
    call insert_delimited_values(education_level, ',', 'education_level_list');
    insert into education_level(applicant_id, lu_education_level_id) select @applicant_id, item from education_level_list;
    drop temporary table education_level_list;
  end if;

  commit;

end;
