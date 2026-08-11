const fs = require('fs');
let content = fs.readFileSync('supabase/schema.sql', 'utf8');

// Replace CREATE TYPE
content = content.replace(
  /CREATE TYPE economic_status_enum AS ENUM \([^)]+\);\s*CREATE TYPE gender_enum AS ENUM \([^)]+\);\s*CREATE TYPE marital_status_enum AS ENUM \([^)]+\);/,
\DO \\$\\$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'economic_status_enum') THEN
    CREATE TYPE economic_status_enum AS ENUM ('BPL', 'APL', 'Others');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
    CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marital_status_enum') THEN
    CREATE TYPE marital_status_enum AS ENUM ('Married', 'Unmarried', 'Widow', 'Child');
  END IF;
END \\$\\$;\
);

// Replace CREATE TABLE with CREATE TABLE IF NOT EXISTS
content = content.replace(/CREATE TABLE public\./g, 'CREATE TABLE IF NOT EXISTS public.');
// Some might already have IF NOT EXISTS, so fix duplicates
content = content.replace(/CREATE TABLE IF NOT EXISTS IF NOT EXISTS/g, 'CREATE TABLE IF NOT EXISTS');

fs.writeFileSync('supabase/schema.sql', content, 'utf8');
console.log('Fixed schema.sql');
