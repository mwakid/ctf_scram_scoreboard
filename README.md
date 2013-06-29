Scram CTF Scoreboard
====================

This is the scoreboard webpage for the Scram CTF.  This webpage contains three main
elements... a scoreboard (displaying all 15 teams scores), a twitter widget, and 
a network visualization tool that utilizes 3DJS.js




PREREQUISITES
-------------
Apache Web Server for static files from /js, /css, /shaders, /textures

Python Reqs:
Twisted
Autobahn
dpkt

SETUP
-----

add soft links in /var/www for /js, /css, /shaders, /textures
			


RUNNING
-------

Start the Scoreboard Server: pyhton /server/scoreboard.py
Navigate to /index.html