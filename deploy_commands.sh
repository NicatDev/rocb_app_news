#!/bin/bash

# Update system
apt-get update
apt-get install -y python3-pip python3-venv nginx

# Backend Setup
cd /rocb_app_news/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Collect static files
python3 manage.py collectstatic --noinput
python3 manage.py migrate

# Setup Systemd for Gunicorn
cp /rocb_app_news/gunicorn.socket /etc/systemd/system/
cp /rocb_app_news/gunicorn.service /etc/systemd/system/

systemctl start gunicorn.socket
systemctl enable gunicorn.socket

# Setup Nginx
cp /rocb_app_news/rocb_nginx /etc/nginx/sites-available/rocb_app
ln -s /etc/nginx/sites-available/rocb_app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default 2>/dev/null

# Frontend Setup (Assuming Node is installed or build is done locally)
# If build is done on server:
# cd /rocb_app_news/frontend
# npm install
# npm run build

# Restart Nginx
systemctl restart nginx
systemctl status nginx
