# tagmein
Tag Me In server software

## Installation on Debian

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

> ```cd ~```

> ```git clone git@github.com:tagmein/tagmein.git```

