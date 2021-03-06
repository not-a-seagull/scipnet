/*
 * reset_db.js
 *
 * scipnet - SCP Hosting Platform
 * Copyright (C) 2019 not_a_seagull
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// this file will drop all of the tables if executed
// change this to "false" if this is ever run in a production environment. we shouldn't take the chance.
const should_tables_be_deleted = true;

if (!should_tables_be_deleted) {
  console.error("Nuh-uh");
  process.exit();
}

var config = require('app/config');
var fs = require('fs');
var sql = require('app/sql');

// remove all files in the content dir

async function removeAll() {
  const query = `
    DROP TABLE Users CASCADE; DROP TABLE Pages CASCADE;
    DROP TABLE passwords; DROP TABLE authors;
    DROP TABLE files; DROP TABLE revisions;
    DROP TABLE ratings; DROP TABLE parents;
    DROP SEQUENCE revisions_seq; DROP TABLE roles;
  `;

  await sql.queryPromise(query, []);
}

removeAll().then(()=>{}).catch((e)=>{console.error("Error: " + e);});

function rmdir(dir) {
  var files = fs.readdirSync(dir);
  var file;
  var stats;
  for (file in files) {
    stats = fs.statSync(file);
    if (stats.isDirectory()) { rmdir(file); fs.rmdirSync(file); }
    else fs.unlinkSync(file);
  }
}
