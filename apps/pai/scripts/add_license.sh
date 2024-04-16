#!/usr/bin/env bash
# exit immediately when a command fails
set -e
# only exit with zero if all commands of the pipeline exit successfully
set -o pipefail
# error on unset variables
set -u

header='<!--
  * kubegems-pai
  * Copyright (C) 2023  kubegems.io
  * 
  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  * 
  * You should have received a copy of the GNU General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->'

noLicenseFiles=$(
    find . -type f -iname '*.vue' ! -path '*/node_modules/*' -exec sh -c 'head -n4 $1 | grep -Eq "(Copyright|generated|GENERATED)" || echo $1' {} {} \;
)

for path in $noLicenseFiles; do
echo -e "$header\n" | cat - $path > temp && mv temp $path
done
