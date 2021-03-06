/*
 * service.ts
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

// registry of services, as well as functions for executing those services
import * as fs from "fs";
import { Server as JaysonServer } from "jayson";
import * as path from "path";

import { config } from "app/config";

// some process info
type ServiceInfo = { [key: string]: { host: any, port: any } };
export const serviceInfo: ServiceInfo = {
  "pagereq": { 
    host: config.get("services.pagereq.host"), 
    port: config.get("services.pagereq.port") 
  }
};

const moduleRoot = "dist/services";

// check, then launch a service if the option is provided
export function runService(modname: string) {
  // tell if we have a module
  const modulePath = path.join(process.cwd(), moduleRoot, modname);
  const moduleService = path.join(modulePath, "service.js");

  if (!(fs.existsSync(moduleService))) {
    console.error(`Error: Module ${modname} not found`);
    process.exit(1);
  }

  // get service variables
  const service = require(moduleService).service();
  const { host, port } = serviceInfo[modname];

  // run server
  const server = new JaysonServer(service);
  console.log(`Launching module ${modname}`);
  server.http().listen(port); // TODO: does host really matter?
}
