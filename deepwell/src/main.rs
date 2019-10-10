/*
 * main.rs
 *
 * deepwell - Database management and migrations service
 * Copyright (C) 2019 Ammon Smith, not_a_seagull
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

#![deny(missing_debug_implementations)]

extern crate chrono;
extern crate color_backtrace;

#[macro_use]
extern crate diesel;
extern crate heck;

#[macro_use]
extern crate serde;
extern crate serde_json;

mod generate;
mod models;
mod schema;

use std::env;

fn main() {
    color_backtrace::install();

    let conn = {
        use diesel::Connection;
        use diesel::pg::PgConnection;

        let url = env::var("DATABASE_URL").expect("DATABASE_URL is not set");
        PgConnection::establish(&url).expect("Error connecting to database")
    };

    let schema = generate::typescript_interfaces(&conn).expect("Unable to load schema");
    println!("{}", schema);
}