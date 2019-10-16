/*
 * server/index.ts
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

// server software - runs on top of https server
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as jayson from "jayson/promise";
import * as path from "path";

import { promisify } from "util";
import * as querystring from "querystring";

import { config } from "app/config";
import { Nullable } from "app/utils";
import { UserTable } from "app/services/user/usertable";

const readFilePromise = promisify(fs.readFile);

// types for the required functions
export type ScipnetStringMap = { [key: string]: string };
export type ScipnetMap = { [key: string]: any };
export interface ScipnetInformation {
  body?: ScipnetMap, // POST request body
  cookies?: ScipnetStringMap, // cookies
  params?: ScipnetMap, // /url/params/like/this

  ip: string
};
export interface ScipnetCookie {
  name: string,
  value: string | number,
  maxAge: number
};
export interface ScipnetOutput {
  _cookie: Array<ScipnetCookie>,
  _redirect: Nullable<string>,
  _send: Nullable<string | Buffer>,
  _type: string,

  cookie: (name: string, value: string | number, maxAge: number) => void,
  redirect: (url: string) => void,
  send: (data: string | Buffer) => void,
  type: (mimeType: string) => void,
};

export type SyncScipnetHandle = (inf: ScipnetInformation, out: ScipnetOutput, ut?: UserTable) => any;
export type AsyncScipnetHandle = (inf: ScipnetInformation, out: ScipnetOutput, ut?: UserTable) => Promise<any>;
export type ScipnetHandle = SyncScipnetHandle | AsyncScipnetHandle;

export type ScipnetFunctionMap = { [key: string]: ScipnetHandle };

// some basic handles
const faviconHandle: ScipnetHandle = async function(inf: ScipnetInformation, out: ScipnetOutput): Promise<string> {
  const faviconSource = await readFilePromise(config.get("files.images.favicon"));
  return faviconSource.toString();
};

export class ScipnetJsonApp { 
  basicPageHandle: Nullable<ScipnetHandle>;
  faviconHandle: ScipnetHandle;
 
  fontHandles: ScipnetFunctionMap;
  imageHandles: ScipnetFunctionMap;

  pageHandle: Nullable<ScipnetHandle>;
  mainHandle: Nullable<ScipnetHandle>;

  bundleHandle: Nullable<ScipnetHandle>;
 
  loginHandle: Nullable<ScipnetHandle>;
  processLoginHandle: Nullable<ScipnetHandle>;
  registerHandle: Nullable<ScipnetHandle>;
  processRegisterHandle: Nullable<ScipnetHandle>;
  pagereqHandle: Nullable<ScipnetHandle>;

  usertable: UserTable;

  constructor() {
    this.basicPageHandle = null;
    this.faviconHandle = faviconHandle;
    this.fontHandles = {};
    this.imageHandles = {};
    this.pageHandle = null;
    this.mainHandle = null;
    this.bundleHandle = null;

    this.loginHandle = null;
    this.processLoginHandle = null;
    this.registerHandle = null;
    this.processRegisterHandle = null;
    this.pagereqHandle = null;

    this.usertable = new UserTable();
  }

  // wrapper for scipnet handles
  wrapHandle(handle: ScipnetHandle): (args: any) => Promise<any> { 
    const scopedThis = this;

    return async function(params: any): Promise<any> {
      // get function information
      const inf: ScipnetInformation = {
        body: params.body,
        params: params.params,
        cookies: params.cookies,
        ip: params.ip
      };
      let output: ScipnetOutput = {
        _cookie: [],
        _send: null,
        _redirect: null,
        _type: "text/html",
  
        cookie: function(name: string, value: string | number, maxAge: number) {
          output._cookie.push({name: name, value: value, maxAge: maxAge});
        },
        redirect: function(url: string) {
          output._redirect = url;
        },
        send: function(data: string | Buffer) {
          if (data instanceof Buffer) {
            output._send = data.toString();
          } else {
            output._send = data;
          }
        },
        type: function(mimeType: string) {
          output._type = mimeType;
        }
      };

      const data = await handle(inf, output, scopedThis.usertable);
      return {
        data: data,
        type: output._type,
        send: output._send,
        redirect: output._redirect,
        cookie: output._cookie
      };
    };
  }

  // run jayson server
  runServer() {
    // create parameters for the server
    let rpcFunctions: ScipnetFunctionMap = {
      "favicon.ico": this.wrapHandle(this.faviconHandle),
      "main": this.wrapHandle(this.mainHandle),
      "sys/login": this.wrapHandle(this.loginHandle),
      "sys/register": this.wrapHandle(this.registerHandle),
      "sys/process-login": this.wrapHandle(this.processLoginHandle),
      "sys/process-register": this.wrapHandle(this.processRegisterHandle),
      "sys/pagereq": this.wrapHandle(this.pagereqHandle)
    };
    for (const font in this.fontHandles) {
      rpcFunctions[`/sys/fonts/${font}`] = this.wrapHandle(this.fontHandles[font]);
    }
    for (const image in this.imageHandles) {
      rpcFunctions[`/sys/images/${image}`] = this.wrapHandle(this.imageHandles[image]);
    }

    const wrappedPageHandle = this.wrapHandle(this.pageHandle);

    // create the server itself
    const server = new jayson.Server(rpcFunctions, {
      router: function(method: string, params: any): jayson.Method {
        // do by-name routing first
        if (typeof(this._methods[method]) === "function") return this._methods[method];

        // look for page
        params.pageid = method;
        return new jayson.Method((args: any, done: (res: any) => any) => {
          wrappedPageHandle(args).then(done).catch((err: Error) => { throw err; });
        });
      }
    }); 

    server.http().listen(config.get("services.scipnet.port"));
  }
}
