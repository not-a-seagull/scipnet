/*
 * handler.ts
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

// sets up handler in the app for pagereq
import { ArgsMapping } from "app/services/pagereq";
import { callJsonMethod } from "app/utils/jsonrpc";
import { config } from "app/config";
import { ScipnetJsonApp, ScipnetInformation, ScipnetOutput } from "app/server";  
import { ActiveSessions } from "app/services/user/usertable";

export default function populateApp(app: ScipnetJsonApp) {
  app.pagereqHandle = async (req: ScipnetInformation, res: ScipnetOutput, ut: ActiveSessions): Promise<any> => {
    const username = ut.check_session(parseInt(req.body.sessionId, 10), req.ip);
    
    let args: ArgsMapping = {};
    Object.assign(args, req.body);
    args.username = username;

    // TODO: replace with whatever event system we end up with
    const response = await callJsonMethod(
      "pagereq", 
      args, 
      config.get("services.pagereq.host"), 
      config.get("services.pagereq.port")
    );

    let result = response.result;
    if (result.errorCode === -1) {
      console.error(result.error);
    }

    return result;
  };
}
