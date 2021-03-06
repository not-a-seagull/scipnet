/*
 * pbkdf2.ts
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

// function to hash a password via the PBKDF2 algorithm
// TODO: this file is obsolete, refactor it out

// convert an ascii string to a byte array
function str_to_bytes(str: string) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i)
        bytes.push(str.charCodeAt(i));
    return new Uint8Array(bytes);
}

// convert an array of bytes to a hex string
function bytes_to_hstring(bytes: any) {
    if (!bytes)
        return null;

    bytes = new Uint8Array(bytes);
    var hex_bytes = [];

    for (var i = 0; i < bytes.length; ++i) {
        var byte_string = bytes[i].toString(16);
        if (byte_string.length < 2)
            byte_string = "0" + byte_string;
        hex_bytes.push(byte_string);
    }

    return hex_bytes.join("");
}

function onErr(err: any) {
  alert("Unable to hash password: " + err);
}

export function hash_password(pwd: string, salt: string, next: any) {
  try {
    const algorithm = "PBKDF2";
    crypto.subtle.importKey("raw", str_to_bytes(pwd), algorithm, false, ["deriveBits"])
      .then(function(key) {
        return crypto.subtle.deriveBits({name: algorithm, salt: str_to_bytes(salt), iterations: 100000, hash: "sha-256"}, key, 128);
      }, onErr).then(function(result) {
        next(bytes_to_hstring(result));
      }, onErr);
  } catch(err) { onErr(err); }
}
