#!/usr/bin/with-contenv bashio
echo "Starting Humansensor with parameters:"
echo "Install package"
pwd
echo "===Files are==="
ls
echo "----starting -----"
echo "UI build is started"
cd ui
pwd
npm install
npm run build
echo "Moving to api"
cd ..
cd api
pwd
echo "Backend build is started"
npm install
echo "App starting"
npm start