/*
 * pagereq.ts
 *
 * scipnet - Multi-tenant writing wiki software
 * Copyright (C) 2019 not_a_seagull, Ammon Smith
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

// sending xmlhttprequests to the server and receiving data in return
// need to include: js/cookie.js

import { getCookie } from './cookie';

// helper function: get slug
export function get_slug() {
  let pathname = window.location.pathname;
  return pathname.split('/')[1];
}

export function prsRequest(name: string, args: any, next: (x: any) => any) {
  // set up a form data with everything needed
  //var fData = new FormData();
  //fData.append('name', name);
  //fData.append('sessionId', getCookie('sessionId'));
  //for (var key in args)
  //  fData.append(key, args[key]);
  args['name'] = name;
  args['sessionId'] = getCookie('sessionId');

  // create callback
  function xhrCallback(this: XMLHttpRequest) {
    console.log(this.responseText);
    let result = JSON.parse(this.responseText);
    next(result);
  };

  // create XMLHttpRequest
  console.log("Sending PRS Request...");
  let req = new XMLHttpRequest();
  req.onload = xhrCallback;

  req.open("POST", "/sys/pagereq");
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  req.send(new URLSearchParams(args));
};
