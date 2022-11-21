### Basic system requirements

-   **Linux** - Installation script tested with: `ubuntu-18.04.1`, but any other should work just fine with manual installation
-   **15GB** - of free disk space
-   **nodejs v11.6.0** or above
-   **PHP 7.3.0** or above

### Front-end and Back-end installation

```bash
    ## Download and install Linux if you don't have one already.
    ## In this example we are using ubuntu-18.04.1 server-amd64

    ## Install pre-requirements

    # Install mariadb and setup mariadb users & database
    sudo apt-get install mariadb-server mariadb-client
    sudo mysql_secure_installation

    # Install PHP and some PHP modules
    sudo apt-get install php-fpm php-mysql
    sudo apt-get install zip unzip php-zip php-simplexml php-curl php-mbstring php-gmp php-libsodium

    # Install node at least version 11.6.0
    curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
    sudo apt-get install gcc g++ make

    ## To install the Yarn package manager, run:
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn

    # Install web server
    sudo apt-get install nginx

    # Install other requirements
    sudo apt-get install git composer openssl gfortran default-jre default-jdk
    sudo apt-get install libgit2-dev libssh2-1-dev libssl-dev libxml2-dev libmariadbclient-dev

    # If you are using Debian or Ubuntu run Install script
    # In case you want to use different OS (e.g. Fedora, CentOS and RHEL)
    # please follow this install script and adjust it to your OS
    cd /tmp
    wget https://github.com/genular/simon-backend/blob/master/documentation/installation/install_dependencies.sh
    chmod 777 install_dependencies.sh

    # Start it and follow instructions
    ./install_dependencies.sh

    # Configure nginx virtual hosts and generate HTTPS certificates
    ## cd /etc/nginx/sites-available
    wget https://github.com/genular/simon-backend/blob/master/documentation/installation/nginx/vhosts.conf
    ## Restart nginx and make sure domains are working

    # Generate certs using letsencrypt: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04
    # sudo certbot certonly --rsa-key-size 4096 --agree-tos -m example@example.com --no-eff-email --keep-until-expirin --nginx -d dashboard.genular.org --dry-run
    # sudo certbot certonly --rsa-key-size 4096 --agree-tos -m example@example.com --no-eff-email --keep-until-expirin --nginx -d analysis.api.genular.org --dry-run
    # sudo certbot certonly --rsa-key-size 4096 --agree-tos -m example@example.com --no-eff-email --keep-until-expirin --nginx -d plots.api.genular.org --dry-run
    # sudo certbot certonly --rsa-key-size 4096 --agree-tos -m example@example.com --no-eff-email --keep-until-expirin --nginx -d backend.api.genular.org --dry-run
    # Or using any other service to obtain certificate

    # Once Certificates are ready adjust their paths in vhosts.conf, enable HTTPS virtual hosts and restart nginx

    ## Make sure you can open backend API server and frontend GUI
    # backend.api.genular.org
    # dashboard.genular.org

    ## After this ones are ready you need to start R API servers
    cd /var/www/genular/simon-backend
    ## You can start them manually separately:
    ## Rscript ./server/analysis/index.R analysis
    ## Rscript ./server/plots/index.R plots

    ## But we suggest using pm2 process manager for the task
    pm2 start ecosystem.config.js
    pm2 status
    ## Generating a startup script
    # Detect available init system, generate configuration and enable startup system
    pm2 startup
    ## DEBUG="pm2:*" pm2 start ecosystem.config.js --only simon-backend --no-daemon


    ## Now when we have all API servers and frontend configured lets configure main CRON task for analysis
    ## Of-course you can run it manually each time task is submitted
    # Rscript ./cron/main.R cron

    ## We suggest creating crontab task like this
    ## Chmod 777 /var/www/genular/simon-backend/cron/main.R
    ## */2 * * * * /usr/bin/flock -n /tmp/simon_backend.pid /var/www/genular/simon-backend/cron/main.R > /var/log/simon-cron.log 2>&1

    ## Cloud - Cron Job
    ## cd /mnt/data/projects/genular/simon-backend/server/backend;
    ## php public/index.php backend/system/cron
    ## php public/index.php backend/system/cron/bb5dc8842ca31d4603d6aa11448d1654
```

## Configuration overview

Back-end is made as multiple separate modules. You can run this modules on one machine or each on separate one.
Analysis is made on multiple cloud servers in parallel to speed-up things, but can also be configured to run on same machine where backend is hosted.

### Analysis back-end

is compatible with any Cloud Provider that supports [openstack compute api](https://developer.openstack.org/api-ref/compute/).
In following example we will use [Hetzner Cloud](https://www.hetzner.com/cloud) as a service provider.

### Data storage

storage back-end is compatible with any S3 object storage like provider.
In following example we will use [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)
