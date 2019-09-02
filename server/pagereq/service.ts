/*
 * service.ts
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

import * as pagereq from './pagereq';

// asynchronous pr
async function async_pr(name: string, username: string, args: pagereq.ArgsMapping): Promise<pagereq.PRSReturnVal> {
  return new Promise((resolve: (r: pagereq.PRSReturnVal) => any, reject: any) => {
    pagereq.request(name, username, args, resolve);
  });
}

// run pagereq as a service
export async function service(data: string): Promise<string> {
  const input = JSON.parse(data);
  let args: pagereq.ArgsMapping = input;
  let name = args["name"];
  let username = "";
  
  // TODO: figure out a way to get the username right w/o access to the UT
  return JSON.stringify(await async_pr(name, username, args));
}
