# tagmein
Tag Me In server software

## Installation on Ubuntu

### Step 1: Install nginx

> ```sudo apt update```

> ```sudo apt install nginx```

> ```sudo ufw allow 'Nginx HTTPS'```

Copy the following to a new file `/etc/sites-available/tagmein`:

```
server {
 server_name your.domain.here.com;
}
```

> ```ln -s /etc/sites-available/tagmein /etc/sites-enabled/tagmein```

### Step 2: Automatic HTTPS with LetsEncrypt

> ```sudo apt install certbot python3-certbot-nginx```

> ```sudo certbot --nginx -d your.domain.here.com```

If you visit your website at this point at https://your.domain.here.com you should see the "Welcome to nginx!" page and a valid secure connection indicated in your web browser. Now that web hosting and domain are correctly configured, it's time to install Tag Me In!

### Step 3: Install Tag Me In server software

> ```cd ~```

> ```git clone git@github.com:tagmein/tagmein.git```

> ```~/tagmein/setup```

### Todo

Nginx prevent listing of /home/
Nginx Access-Control-Allow-Origin *
