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

// run certain modules as services
import { ChildProcess, fork, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { config } from 'app/config';
import { ServiceConfig } from 'app/old-service-wrapper';

const module_root = 'dist/services';

export interface ServiceInfo {
  process: ChildProcess;
  port: number;
  ip_addr: string;
};

// with the input of a module and a port, run a service
export function runservice(modname: string, serv_config: ServiceConfig): ServiceInfo {
  // get path of module
  let module_path = path.join(process.cwd(), module_root, modname);
  let module_service = path.join(module_path, "service.js");
  if (!(fs.existsSync(module_service))) {
    throw new Error("Service not found: " + module_service);
  }

  return {process: fork(path.join(process.cwd(), "dist/old-service-wrapper.js"),
                        [module_service, JSON.stringify(serv_config)]),
          port: serv_config.hosts[0].port,
        ip_addr: serv_config.hosts[0].address}
}

// ftml-json is built in rust, thus we need a special function to run it
export function runftmlservice(): ServiceInfo {
  console.log("Running FTML as a service");
  let ftml_path = path.join(process.cwd(), '../ftml-json/target/release/ftml-json');
  let config_path = path.join(process.cwd(), '../ftml-json/misc/config.toml');

  let ftml = spawn(ftml_path, [config_path]);
  ftml.stdout.on('data', (data: any) => {
    console.log(`[ftml] ${data}`);
  });
  ftml.stderr.on('data', (data: any) => {
    console.log(`[ftml] ${data}`);
  });

  return {
    process: ftml,
    port: config.get('services.ftml.port'),
    ip_addr: config.get('services.ftml.host'),
  };
}
