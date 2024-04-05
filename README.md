<div align="center">
    <!-- 
    <p align="center">
        <a href="https://genular.org" target="_blank">
            <img width="200" src="https://github.com/genular/pandora/raw/master/.github/static/favicon.png"></a>
    </p>
    -->
    <h1>PANDORA<br/><sub>Pan-Dimensional Omics and Research Analysis</sub></h1>
    <p align="center">
        <a href="https://crowdin.com/project/genular" alt="Help us translate">
            <img src="https://d322cqt584bo4o.cloudfront.net/genular/localized.svg" /></a>
        <a href="#reposize">
            <img src="https://img.shields.io/github/repo-size/genular/pandora.svg" /></a>
        <a href="http://webchat.freenode.net/?randomnick=1&channels=genular&uio=d4" alt="chat on freenode">
            <img src="https://img.shields.io/badge/chat-on%20freenode-brightgreen.svg" alt="chat on freenode"></a>
    </p>
</div>

`PANDORA` is a versatile web-based platform for integrating, analyzing, and visualizing diverse biological data, including clinical, transcriptome, and microbiome datasets.

## Overview
It can be applied to various use cases, such as identifying infection markers, discovering gut bacteria connections to cancer, predicting disease outcomes, examining vaccine immune responses, drug discovery, biomarker identification for personalized medicine, and analyzing omics data for systems biology research. Perform complex analyses using multiple supported machine learning models and techniques, including clustering, heatmap generation, t-SNE, UMAP, and much more.

## Installation Quick-start

`PANDORA` can be installed using Docker, a pre-built version of the platform can be pulled from [DockerHub](https://hub.docker.com/). In order to run `PANDORA`, users will first need to install [Docker](https://www.docker.com/).

#### Requirements

##### Software:

-   Windows, Linux or MacOS
-   [Docker](https://docs.docker.com/engine/installation/) (`version 17.05` or later is required)

##### Minimum suggested hardware recommendation:

-   64GB RAM
-   8 CPU Cores / 16 threads with 3.60 GHz base frequency

#### Installing PANDORA

-   Please **open** your favorite **Terminal** and **run** the **command below**. On Windows - open `Windows Power Shell` => _Click Start, type PowerShell, and then click Windows PowerShel_

```bash
docker run --rm --detach --name genular --tty --interactive --env IS_DOCKER='true' --env TZ=Europe/London --oom-kill-disable --volume genular_frontend_latest:/var/www/genular/pandora --volume genular_backend_latest:/var/www/genular/pandora-backend --volume genular_data_latest:/mnt/usrdata --publish 3010:3010 --publish 3011:3011 --publish 3012:3012 --publish 3013:3013 genular/pandora:latest
```

`PANDORA` will be downloaded and started, and it can be accessed via a web browser at [http://localhost:3010](http://localhost:3010)

-   If you get asked, please _allow connections_ through your _Windows Firewall_.

#### Reinstalling PANDORA

To ensure a clean reinstallation of PANDORA, follow these steps to remove the existing Docker container, images, and volumes associated with PANDORA. This process will remove all data and settings related to the previous PANDORA installation.

Identify Your Docker Entities
Identify the names or IDs of your PANDORA container(s), volume(s), and image(s). 

Use these commands to list entities:
Containers: `docker ps` (for running) or `docker ps -a` (for all)
Volumes: `docker volume ls`
Images: `docker images`

```bash
## Stop the Running PANDORA Container
docker stop <ContainerName>

## Remove the PANDORA Container
docker rm <ContainerName>

## Remove PANDORA Volumes
docker volume rm genular_frontend_latest genular_backend_latest genular_data_latest
```

Please make sure to delete `PANDORA` data volume and image before reinstalling otherwise you will maybe still use old `PANDORA` instance when you run it!

### Contributing, writing code

Contributions are very much welcome!

If you need any help, please use [community forums](https://community.genular.org).

1. Check out our [public issues board][0]. If your issue isn't on the board, [open a new one][1].
2. Pick an issue that nobody has claimed and start working on it.
3. Fork the project ([Need help forking a project?][3]). You'll do all of your work on your forked copy.
4. Create a branch specific to the issue or feature you are working on. Push your work on that branch ([Need help with branching?][4]).
5. Name the branch something like `fixes-xxx-issue` or `add-xxx-feature` where `xxx` is a short description of the changes or feature you are adding.
6. Once your code is ready, submit a pull request from your branch to `PANDORA` `master` branch. We'll do a quick review and give you feedback.

[0]: https://github.com/genular/pandora/issues
[1]: https://github.com/genular/pandora/issues/new/choose
[3]: https://help.github.com/articles/fork-a-repo/
[4]: https://github.com/Kunena/Kunena-Forum/wiki/Create-a-new-branch-with-git-and-manage-branches

### Reaching Out

If you'd like to start a conversation feel free to [e-mail us](mailto:info@genular.com).
I would also like to hear from you if you find this project useful and helpful!

-   Join us on `#genular` on `freenode.net` (or use the [web client](https://webchat.freenode.net/?channels=genular)).
-   Find us [on Twitter](https://twitter.com/genular) under @genular
-   Check out [community forums](https://community.genular.org)

## Security Vulnerabilities

If you discover a security vulnerability within `PANDORA`, please [e-mail us](mailto:info@genular.com). All security vulnerabilities will be promptly addressed. You are also welcome to open PR request.

## Additional Links

| Resource      | Link                                             |
| ------------- | ------------------------------------------------ |
| File an issue | https://github.com/genular/pandora/issues |
| Blog          | https://genular.org/blog/                        |
| Twitter       | https://twitter.com/genular                      |

## License

`PANDORA` is open-source platform, for more information please check `LICENCE` file.

## Citation

`PANDORA` can be used for research purposes, you should cite
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
