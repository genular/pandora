<p align="center">
    <img width="200" src="https://github.com/genular/simon-frontend/raw/master/src/app/assets/logo/png/dark_logo_transparent@2x.png">         
</p>
<p align="center">
    <a href="https://crowdin.com/project/genular" alt="Help us translate">
        <img src="https://d322cqt584bo4o.cloudfront.net/genular/localized.svg" /></a>
    <a href="https://app.fossa.io/projects/git%2Bgithub.com%2Fgenular%2Fsimon-frontend?ref=badge_small" alt="Licence">
        <img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgenular%2Fsimon-frontend.svg?type=small" /></a>
    <a href="#reposize">
        <img src="https://img.shields.io/github/repo-size/genular/simon-frontend.svg" /></a>
    <a href="https://twitter.com/intent/follow?screen_name=genular" alt="Follow us on twitter">
        <img src="https://img.shields.io/twitter/follow/genular.svg?label=Follow&style=social&logo=twitter" alt="Follow us on twitter"></a>
    <a href="https://app.netlify.com/sites/genular/deploys" alt="Netlify Status">
        <img src="https://api.netlify.com/api/v1/badges/c8574166-e345-4296-8875-820f219f7a3c/deploy-status" alt="Netlify Status"></a>
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
Installation instructions are located in [this](INSTALL.md) file.
If you believe you don't have necessarily skills to do so, you could always ask a friend to help you or check out our [demo](https://dashboard.genular.org)

## Community

### Getting Help
Please **do not post** usage questions to GitHub Issues. For these types of questions use our [forum](https://community.genular.org) or please post questions with the [`simon` tag on Stack Overflow](http://stackoverflow.com/questions/tagged/simon)..

### Submitting Bugs and Enhancements
[GitHub Issues](https://github.com/genular/simon-frontend/issues) is for suggesting enhancements and reporting bugs.
We appreciate all enhancements ideas and bug reports. Additionally if you think you can help us with suggesting new useful features we will gladly accept it.
Here you can find [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Places to Help
We're looking for co-maintainers! If you want to become one please write to [LogIN-](https://github.com/LogIN-).

In addition to contributing, optimizing and reviewing code, writing bug and feature requests you can help with following:

Project | How To Help | Next Step
--- | --- | --- |
Localization | Help us translate `SIMON` into your language. If some translation is missing or incorrect you can easily help us by correcting it. | [Join our Translation Community](https://crowdin.com/project/genular)
Tutorials | Help others use `SIMON` | Write a tutorial or record it, with usage examples
Organizing | Ask clarifying questions on recently opened issues to move the discussion forward | [Here](https://github.com/genular/simon-frontend/issues)

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
I would also gladly like to hear from you if you find this project useful and helpful.

## Security Vulnerabilities
If you discover a security vulnerability within `SIMON`, please send e-mail to me at [info@genular.com](mailto:info@genular.com). All security vulnerabilities will be promptly addressed. You are also welcome to open PR request.

## License
Please check `LICENCE` file for more information.
The Software is provided "as is", without warranty of any kind.

## Citation
This software can be used for research purposes, you should cite
the aforementioned papers in any resulting publication.
```
@article {Tomic545186,
    author = {Tomic, Adriana and Tomic, Ivan and Rosenberg-Hasson, Yael and Dekker, Cornelia L. and Maecker, Holden T. and Davis, Mark M.},
    title = {SIMON, an automated machine learning system reveals immune signatures of influenza vaccine responses},
    elocation-id = {545186},
    year = {2019},
    doi = {10.1101/545186},
    publisher = {Cold Spring Harbor Laboratory},
    abstract = {Machine learning holds considerable promise for understanding complex biological processes such as vaccine responses. Capturing interindividual variability is essential to increase the statistical power necessary for building more accurate predictive models. However, available approaches have difficulty coping with incomplete datasets which is often the case when combining studies. Additionally, there are hundreds of algorithms available and no simple way to find the optimal one. Here, we developed Sequential Iterative Modelling "OverNight" or SIMON, an automated machine learning system that compares results from 128 different algorithms and is particularly suitable for datasets containing many missing values. We applied SIMON to data from five clinical studies of seasonal influenza vaccination. The results reveal previously unrecognized CD4+ and CD8+ T cell subsets strongly associated with a robust antibody response to influenza antigens. These results demonstrate that SIMON can greatly speed up the choice of analysis modalities. Hence, it is a highly useful approach for data-driven hypothesis generation from disparate clinical datasets. Our strategy could be used to gain biological insight from ever-expanding heterogeneous datasets that are publicly available.},
    URL = {https://www.biorxiv.org/content/early/2019/02/10/545186},
    eprint = {https://www.biorxiv.org/content/early/2019/02/10/545186.full.pdf},
    journal = {bioRxiv}
}
```