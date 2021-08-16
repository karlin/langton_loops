#!/bin/sh
coffee -c langton_loops.coffee && python -m http.server 8888 &
echo
echo "Open a browser to http://localhost:8888/index.html"
