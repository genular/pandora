<p align="center">
    <img width="200" src="https://github.com/genular/simon-frontend/raw/master/src/app/assets/logo/png/dark_logo_transparent@2x.png">
</p>

> Front-end interface for SIMON

<h1 align="center">Introduction</h1>

`SIMON` is a powerful, flexible, open-source and easy to use knowledge discovery application.

Currently `SIMON` implements automated machine learning and statistical data discovery features
that will help you to easily illustrate dynamic relationships and provide you with a structural sense of your data.

Goal of this project is to make unified user interface that will empower anyone to extract meaningful information from their data and enable them to rapidly use machine learning algorithms. `It gives you freedom and control over your own data.`

While `SIMON` can be used in across many different fields, 
our focus here is scientific community so we can enable scientist and other researchers in the field to quickly prototype around their data and get meaningful results out of it.

## Why is this so awesome?
* :file_folder: **Feature learning** You can discover relevant trends and patterns with ease, that would usually take years of manual handcrafting.
* :package: **Visualize & analyze** Exploratory analysis will give you instant insights with help of many different algorithms.
* :arrows_counterclockwise: **Share your Data** You share your results with others
* :cloud: **All Benefits of the Cloud** ...on your own Server, in your own control.
* :lock: **Encryption** You can encrypt data in transit with secure https connections.
* :lock: **Privacy** Since data is hosted on your own servers you don't have to worry about someone else is looking after your data


## Installation Quickstart
To install and configure `SIMON` you will need basic knowledge of Linux, how to set up databases (MySQL) and web server (Apache, nginx) together with R and PHP configuration.
If you believe you don't have necessarily skills to do so, you could always ask a friend to help you or check out our [demo](https://dashboard.genular.org)

### Basic system requirements
* **Linux**  - Installation script tested with: `ubuntu-18.04.1`, but any other should work just fine with manual installation
* **15GB**   - of free disk space
* **nodejs v11.6.0** or above
* **PHP 7.3.0** or above

### Frontend and Backend installation
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
Backend is made as multiple separate modules. You can run this modules on one machine or each on separate one.
Analysis is made on multiple cloud servers in parallel to speed-up things, but can also be configured to run on same machine where backend is hosted.

### Analysis backend
is compatible with any Cloud Provider that supports [openstack compute api](https://developer.openstack.org/api-ref/compute/).
In following example we will use [Hetzner Cloud](https://www.hetzner.com/cloud) as a service provider.

### Data storage
storage backend is compatible with any S3 object storage like provider.
In following example we will use [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces/)


## Translations
Translations are managed in https://crowdin.com/project/genular

## Community

### Getting Help
Please **do not post** usage questions to GitHub Issues. For these types of questions use our [forum] or please post questions with the [`simon` tag on Stack Overflow](http://stackoverflow.com/questions/tagged/simon)..

###Submitting Bugs and Enhancements
[GitHub Issues](https://github.com/genular) is for suggesting enhancements and reporting bugs.
We appreciate all enhancements ideas and bug reports. Additionally if you think you can help us with suggesting new useful features we will gladly accept it.

### Places to Help
We're looking for co-maintainers! If you want to become one please write to [LogIN-](https://github.com/LogIN-).

In addition to contributing, optimizing and reviewing code, you can help with following:

Project | How To Help | Next Step
--- | --- | --- |
Localization | Help us translate `SIMON` into your language | [Join our Translation Community](https://crowdin.com/project/genular)
Tutorials | Help others use `SIMON` | Write a tutorial or record it, with examples
Organizing | Ask clarifying questions on recently opened issues to move the discussion forward | [Here](https://crowdin.com/project/genular)

## Browser Support
Tested on `Firefox Quantum 64` or above. As much as we like other browsers we are focusing here to primary provide support for open source ones.

<!---
## Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/genular#backer)]

## Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/genular#sponsor)]
-->

### Reaching Out
If you'd like to start a conversation feel free to e-mail me at [info@genular.com](mailto:info@genular.com)

## Security Vulnerabilities
If you discover a security vulnerability within `SIMON`, please send e-mail to me at [info@genular.com](mailto:info@genular.com). All security vulnerabilities will be promptly addressed.

## License
This software is provided under the provisions of the `GNU AFFERO GENERAL PUBLIC LICENSE Version 3, 19 November 2007`. 
Please check `LICENCE` file for more information.

This software can be used for research purposes, you should cite
the aforementioned papers in any resulting publication.

The Software is provided "as is", without warranty of any kind.

## Citation
If you use our code for research, please cite our paper.
To do so please contact us at [info@genular.com](mailto:info@genular.com)