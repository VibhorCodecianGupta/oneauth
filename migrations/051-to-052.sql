alter table authtokens add column expires date default now() + 86400*1000;
