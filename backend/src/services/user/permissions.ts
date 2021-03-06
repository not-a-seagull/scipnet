/*
 * permissions.ts
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

export type PermissionName = "editPages" |
                             "createPages" |
                             "voteOnPages" |
                             "tagPages" |
                             "revertRevisions" |
                             "deletePages" |
                             "ratePages" |
                             "lockPages" |
                             "modifyLockedPages" |
                             "createEditRoles" |
                             "promoteRoles";
// Noting that I tried this but it threw an error with Object.assign()

// a list of applicable permissions
export interface Permission {
  name: PermissionName;
  display_name: string;
}

export interface PermissionValuePair {
  permission: Permission;
  value: boolean;
}

// add new permissions here
export const DEFAULT_PERMISSIONS: Array<PermissionValuePair> = [
  { permission: { name: "editPages", display_name: "Edit Pages" }, value: true },
  { permission: { name: "createPages", display_name: "Create Pages" }, value: true },
  { permission: { name: "voteOnPages", display_name: "Vote on Pages" }, value: true },
  { permission: { name: "tagPages", display_name: "Tag Pages" }, value: true },
  { permission: { name: "revertRevisions", display_name: "Revert Revisions" }, value: true },
  { permission: { name: "deletePages", display_name: "Delete Pages" }, value: false },
  { permission: { name: "ratePages", display_name: "Rate Pages" }, value: true },
  
  { permission: { name: "lockPages", display_name: "Lock Pages" }, value: false },
  { permission: { name: "modifyLockedPages", display_name: "Modify Locked Pages (Every action they can do normally, can be done to locked pages)" }, value: false },

  { permission: { name: "createEditRoles", display_name: "Create and Edit Roles" }, value: false },
  { permission: { name: "promoteRoles", display_name: "Promote Users to Roles" }, value: false },
];

export const NumPermissions = DEFAULT_PERMISSIONS.length;

// helper functions for big numbers
function getLargenumVal(permset: number, index: number): boolean {
  return (permset & (1 << index)) > 0;
}

function setLargenumVal(permset: number, index: number, value: boolean): number {
  if (value) {
    permset |= (1 << index);
  } else {
    permset &= ~(1 << index);
  }
  return permset;
}


// a set of permissions
export class Permset {
  permissions: Array<PermissionValuePair>;

  constructor() {
    this.permissions = DEFAULT_PERMISSIONS.map(p => {
      const value = {
        permission: {
          name: p.permission.name,
          display_name: p.permission.display_name,
        },
        value: p.value
      };
      return value;
    });
  }

  // get a permset from a stored number
  static fromNumber(value: number): Permset {
    const permset = new Permset();
    for (let i = 0; i < NumPermissions; i++) {
      permset.permissions[i].value = getLargenumVal(value, i); 
    }
    return permset;
  }

  // get a storable number
  getNumber(): number {
    let value = 0;
    let permission;

    for (let i = 0; i < NumPermissions; i++) {
      permission = this.permissions[i];
      if (this.permissions[i].value) {
        value |= (1 << i); 
      }
    }

    return value;
  }

  // get the value of a permissions
  hasPermission(permname: PermissionName): boolean {
    for (const permission of this.permissions) {
      if (permission.permission.name === permname) {
        return permission.value;
      }
    }
    return false;
  }

  // set the value of a permission
  setPermission(permname: PermissionName, value: boolean) {
    for (let i = 0; i < NumPermissions; i++) {
      let permission = this.permissions[i];
      if (permission.permission.name === permname) {
        permission.value = value;
        this.permissions[i] = permission;
        return;
      }
    }
  }
}
