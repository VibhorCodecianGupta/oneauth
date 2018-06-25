alter table authtokens add column expires date default now() + 86400*1000;
alter table clients add column "defaultURL" varchar(255) NOT NULL default 'https://codingblocks.com/';
alter table sessions add column "ipAddr" varchar(15);
