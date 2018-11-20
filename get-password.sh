#!/usr/bin/env bash
pm2 logs --nostream --out --lines 1 | sed -n 2p | cut -d ' ' -f 1 | xargs cat | grep "Admin password" | tail -n 1 | rev | cut -d ' ' -f 1 | rev
