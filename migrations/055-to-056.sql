alter table addresses alter column label varchar(255) default null;
alter table addresses add column wa_number varchar(10) default null unique;
