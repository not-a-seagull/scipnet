#
# Makefile
#
# scipnet - SCP Hosting Platform
# Copyright (C) 2019 not_a_seagull, Ammon Smith
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

include sources.mk

.PHONY: default prepare clean

default: dist/index.js

prepare:
	npm install

dist/index.js: $(patsubst backend/%,%,$(BACKEND_SOURCES))
	npm run gulp

clean:
	rm -rf dist/*.js
