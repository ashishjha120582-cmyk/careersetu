@echo off
cd /d "D:\Ashish project\Economic Opp"
"C:\Program Files\nodejs\node.exe" --use-system-ca "prototype\server.js" >> "server.out.log" 2>> "server.err.log"
