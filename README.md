# Future Fellows
Future Fellows helps manage resumes for candidates to be considered for postdoctoral fellowship, intern and professional positions at NCI.

## Requirements
- Node.js 10+
- MySQL 5.7+

## Getting Started

```bash
git clone https://github.com/CBIIT/nci-webtools-ccr-future-fellows.git

cd nci-webtools-ccr-future-fellows

# set up database
pushd database
mysql \
    --host=$mysql_host \
    --user=$mysql_user \
    --password=$mysql_password \
    $future_fellows_database < \
        schema.sql \
        populate_lookup_tables.sql \
        stored_procedures.sql
popd

# create config.json with values specific to your environment
cp config.example.json config.json

npm install

npm start
```
