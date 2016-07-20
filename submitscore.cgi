#!/bin/bash
/bin/echo "Content-type: text/html"
/bin/echo
/bin/echo "<html>"
python addscore.py "$QUERY_STRING"
/bin/echo "<script>"
/bin/echo "window.location = 'http://users.wpi.edu/~ngeller';"
/bin/echo "</script>"
/bin/echo "</html>"
