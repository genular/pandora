<div align="center">
    <p align="center">
        <a href="https://genular.org" target="_blank">
            <img width="200" src="https://github.com/genular/simon-frontend/raw/master/.github/static/black_logo_notext_transparent@2x.png"></a>
    </p>
    <h1>SIMON<br/><sub>machine learning feature discovery platform</sub></h1>
    <p align="center">
        <a href="https://crowdin.com/project/genular" alt="Help us translate">
            <img src="https://d322cqt584bo4o.cloudfront.net/genular/localized.svg" /></a>
        <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fgenular%2Fsimon-frontend?ref=badge_small" alt="Licence">
            <img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgenular%2Fsimon-frontend.svg?type=small" /></a>
        <a href="#reposize">
            <img src="https://img.shields.io/github/repo-size/genular/simon-frontend.svg" /></a>
        <a href="https://twitter.com/intent/follow?screen_name=genular" alt="Follow us on twitter">
            <img src="https://img.shields.io/twitter/follow/genular.svg?label=Follow&style=social&logo=twitter" alt="Follow us on twitter"></a>
        <a href="http://webchat.freenode.net/?randomnick=1&channels=genular&uio=d4" alt="chat on freenode">
            <img src="https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg" alt="chat on freenode"></a>
        <a href="https://app.netlify.com/sites/genular/deploys" alt="netlify status">
            <img src="https://api.netlify.com/api/v1/badges/c8574166-e345-4296-8875-820f219f7a3c/deploy-status" alt="netlify status"></a>
    </p>
</div>

## Intro

`SIMON` is a powerful, flexible, open-source and easy to use Data Science Knowledge Discovery software. Check out <a href="https://dashboard.genular.org" target="_blank">live demo</a> or <a href="https://genular.org/simon-screenshots/" target="_blank">maybe better, view screenshots</a>.
Currently `SIMON` implements Machine Learning and many other statistical data discovery features ([Hierarchical clustering](https://en.wikipedia.org/wiki/Hierarchical_clustering), [Correlation](https://en.wikipedia.org/wiki/Correlation_and_dependence), [PCA Analysis](https://en.wikipedia.org/wiki/Principal_component_analysis), [UMAP](https://en.wikipedia.org/wiki/Nonlinear_dimensionality_reduction), [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding) and others) that will help you to illustrate dynamic relationships and provide you with a structural sense of your data.

Goal of this project is to make user interface that will empower scientists, makers and other domain experts to extract meaningful information from their data and enable them to rapidly use and quickly prototype with different machine learning algorithms `genular` is an entirely open source community behind `SIMON`, if you wish to learn more visit us [here](https://genular.org)

## Why is this so cool?

-   :file_folder: **feature discovery** you can discover relevant trends and patterns inside your data with ease, that would usually take years of manual handcrafting
-   :chart: **machine learning** Build Machine Learning models with ease, and quickly compare them via our innovative interface
-   :package: **exploratory data analysis** visual analysis of multiple different machine learning results will give you instant insights with help of many different visualization algorithms
-   :arrows*counterclockwise: **sharing is caring** you can share your results with others, deploy your models instantly\* *(in progress)\_ or download your data for external use
-   :closed_lock_with_key: **privacy and security** hosting `SIMON` on your own dedicated servers or laptop you don't have to worry about someone else is looking after your data and your models

## Current version features

<img alt="SIMON UI screenshot" src=".github/static/simon_analysis.png" align="right" width="500px"/>

-   **200+** machine learning algorithms to <a href="https://topepo.github.io/caret/available-models.html" target="_blank">choose from</a>
-   nicely designed **drag&drop** user interface to easily apply _data modeling techniques_
-   supports **high sparsity** data via data imputation or <a href="https://cran.r-project.org/web/packages/mulset/index.html" target="_blank" title="Multiset Intersection Generator">mulset</a>
-   supports **local** and **cloud** backend data storage
-   compare all **model performance measures** in one place
-   visual **data analysis** that supports _clustering_ and _correlation graphs_
-   visual **feature analysis** with dot-plots that supports **280 visual styles**
-   visual **model performance comparison** and **model insights**
-   in-build **data preprocessing** (correlation filtering, normalization, imputation...)
-   public dataset repository import to **easily import** and **analyze** already published data\* _(in progress)_
-   integrated **SAM (Significance Analysis of Microarrays)** technique for finding significant genes in a set of microarray experiments
-   **multi-language** localization support
-   **model & data export** take your ML models and other performed analysis, reproducibility code and associated data with you on the go\* _(in progress)_

---

## Installation Quickstart

### Easy

This section describes the process of pulling a pre-built version of `SIMON` from [DockerHub](https://hub.docker.com/).
If you are beginner or you wish to quickly check it out this is recommended way to start `SIMON`. This can also be very handy for developers for development without polluting the host machine.
The `SIMON` source code includes a [Dockerfile](https://github.com/genular/simon-backend/blob/master/documentation/docker_images/Dockerfile).

#### Requirements

-   [Docker](https://docs.docker.com/engine/installation/) (`version 17.05` or later is required)
-   [Docker Windows installation tutorial](https://docs.docker.com/docker-for-windows/install/)
-   [Docker Windows direct download](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)

#### Running SIMON Docker Container

In order to run a test instance of `SIMON` we first need to prepare the local environment.

1. Download and install [Docker](https://docker.com). When you finished installing [Docker](https://docs.docker.com/engine/installation/) please _continue_ to steps below.

2. Lets download and run the [genular/simon](https://cloud.docker.com/u/genular/repository/docker/genular/simon) image from DockerHub.

-   Then we will run `SIMON` with appropriately mounted volumes and port mapping. By default `SIMON` will run with a Docker Volume file-system inside of it.
-   Please **open** your favorite **Terminal** and **run** the **command below**. If on Windows - open `Windows Power Shell` => _Click Start, type PowerShell, and then click Windows PowerShel_

> _If you wish to get correct time inside SIMON, replace TZ=<timzone> variable with your timezone. You can find list of supported timezones [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)_

```bash
docker run --rm --detach --name genular --tty --interactive --env IS_DOCKER='true' --env TZ=Europe/London --volume genular_data:/mnt/usrdata --publish 3010:3010 --publish 3011:3011 --publish 3012:3012 --publish 3013:3013 genular/simon:latest

```

3. Once command is executed and the `SIMON` is downloaded and started you can access it on `http://localhost:3010` via your web favorite browser _(we recommend [Firefox](https://www.mozilla.org/en-GB/firefox/new/))_ and create your administrator account.

-   If you get asked, please _allow connections_ through your _Windows Firewall_.

#### Reinstalling SIMON

In order to re-install `SIMON` you need to delete previously installed `SIMON` Docker container and associate data/volumes. More info about that on ,<a href ="https://docs.docker.com/config/pruning/"  target="_blank">official Docker documentation.</a> To delete all Docker Images, Containers, Volumes, and Networks execute following:

```bash
docker system prune -a
```

Please be sure to delete `SIMON` data volume and container before reinstalling otherwise you will maybe still use old `SIMON` instance when you run it!

##### Other information

_To run latest Released version (0.2.0), please use following Docker image `genular/simon:0.2.0`_

```bash
docker run --rm --detach --name genular --tty --interactive --env IS_DOCKER='true' --env TZ=Europe/London --volume genular_data:/mnt/usrdata --publish 3010:3010 --publish 3011:3011 --publish 3012:3012 --publish 3013:3013 genular/simon:0.2.0
```

`SIMON` will now run until you _shutdown/restart_ your machine or _stop it manually_.
To manually stop `SIMON` container please type following command:

```bash
docker stop genular
```

When you wish to start and use `SIMON` again please type-in Docker run command from above, again!

To delete all data and reset `SIMON` to factory defaults you need to clear data inside volume you configured.
If you used default run configuration please execute following command:

```bash
docker volume rm genular_data
```

### Advanced

To install and configure `SIMON` from source you will need knowledge of [Linux](https://en.wikipedia.org/wiki/Linux), how to set up databases ([MySQL](https://mariadb.org/)) and web server ([Apache](https://www.apache.org/), [nginx](https://nginx.org/en/)) together with [R](https://www.r-project.org/) and [PHP](https://www.php.net/) setup and configuration.

> Installation instructions are located in [this file](https://github.com/genular/simon-frontend/blob/master/INSTALL.md).
> You can find semi-automated bash installation script [here](https://github.com/genular/simon-backend/blob/master/documentation/installation/install_dependencies.sh), that can also help you to get started and guide you through installation process.

If you believe you don't have necessarily skills to install `SIMON`, you could always ask a friend to help you or check out our [demo](https://dashboard.genular.org)

## Community

### Getting Help

Please **do not post** usage questions to GitHub Issues pages.
For these types of questions use our [forum](https://community.genular.org)

### Submitting Bugs and Enhancements

[GitHub Issues](https://github.com/genular/simon-frontend/issues) is for suggesting enhancements and reporting bugs.
We appreciate all enhancements ideas and bug reports. Additionally if you think you can help us with suggesting new useful features we will gladly accept it.
Here you can find [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

#### Contributing, writing code

Contributions are very much welcome!

If you need any help, please use [community forums](https://community.genular.org).

1. Check out our [public issues board][0]. If your issue isn't on the board, [open a new one][1].
2. Pick an issue that nobody has claimed and start working on it.
3. Fork the project ([Need help forking a project?][3]). You'll do all of your work on your forked copy.
4. Create a branch specific to the issue or feature you are working on. Push your work on that branch ([Need help with branching?][4]).
5. Name the branch something like `fixes-xxx-issue` or `add-xxx-feature` where `xxx` is a short description of the changes or feature you are adding.
6. Once your code is ready, submit a pull request from your branch to SIMON `master` branch. We'll do a quick review and give you feedback.

[0]: https://github.com/genular/simon-frontend/issues
[1]: https://github.com/genular/simon-frontend/issues/new/choose
[3]: https://help.github.com/articles/fork-a-repo/
[4]: https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches

### Places to Help

We're looking for contributors!
In addition to contributing, optimizing and reviewing code, writing bug and feature requests you can help with following:

| Project       | How To Help                                                                                                                        | Next Step                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Localization  | Help us translate `SIMON` into your language. If some translation is missing or incorrect you can easily help us by correcting it. | [Join our Translation Community](https://crowdin.com/project/genular) |
| Tutorials     | Help others use and understand `SIMON`                                                                                             | Write a tutorial or record it, with usage examples                    |
| Organizing    | Ask clarifying questions on recently opened GitHub issues to move the discussion forward                                           | [Here](https://github.com/genular/simon-frontend/issues)              |
| Write article | Help others understand what is Machine Learning & how can they apply it, by publishing blog post                                   | [e-mail us](mailto:info@genular.com)                                  |

## Browser Support

Tested on `Firefox Version 86`. As much as we like other browsers we are focusing here to primary provide support for open source ones.

### Reaching Out

If you'd like to start a conversation feel free to [e-mail us](mailto:info@genular.com).
I would also like to hear from you if you find this project useful and helpful!

-   Join us on `#genular` on `freenode.net` (or use the [web client](https://webchat.freenode.net/?channels=genular)).
-   Find us [on Twitter](https://twitter.com/genular) under @genular
-   Check out [community forums](https://community.genular.org)

## Security Vulnerabilities

If you discover a security vulnerability within `SIMON`, please [e-mail us](mailto:info@genular.com). All security vulnerabilities will be promptly addressed. You are also welcome to open PR request.

## Additional Links

| Resource      | Link                                             |
| ------------- | ------------------------------------------------ |
| File an issue | https://github.com/genular/simon-frontend/issues |
| Blog          | https://genular.org/blog/                        |
| Twitter       | https://twitter.com/genular                      |

## License

`SIMON` is open-source software for more informations please check `LICENCE` file.

## Citation

This software can be used for research purposes, you should cite
the aforementioned papers in any resulting publication.

```bash
    Adriana Tomic, Ivan Tomic, Yael Rosenberg-Hasson, Cornelia L. Dekker, Holden T. Maecker, Mark M. Davis.
    SIMON, an Automated Machine Learning System, Reveals Immune Signatures of Influenza Vaccine Responses
    http://www.jimmunol.org/content/early/2019/06/13/jimmunol.1900033.abstract
    doi: 10.4049/jimmunol.1900033
```

```bash
    Adriana Tomic, Ivan Tomic, Levi Waldron, Ludwig Geistlinger, Max Kuhn, Rachel L. Spreng, Lindsay C. Dahora, Kelly E. Seaton, Georgia Tomaras, Jennifer Hill, Niharika A. Duggal, Ross D. Pollock, Norman R. Lazarus, Stephen D.R. Harridge, Janet M. Lord, Purvesh Khatri, Andrew J. Pollard, Mark M. Davis.
    SIMON: Open-Source Knowledge Discovery Platform
    https://www.cell.com/patterns/fulltext/S2666-3899(20)30242-7
    doi:10.1016/j.patter.2020.100178
```
