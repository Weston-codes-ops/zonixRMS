/* Bridge that acts as a translator between frontend page (Index.js)
and backend desktop controller (main.js)

Reason -> To strictly prevent React Webpages from accessing computer files,
database and OS directly or to prevent malicious code from wiping your hard drive

 In this script, you selectively choose what secure channels or safe functions your webpage is allowed to use, 
exposing them via an object eg naming it electronAPI

It accomplishes this through a secure window gate called contextBridge

*/


