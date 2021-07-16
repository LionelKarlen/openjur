# Openjur 

Open implementation of the winjur timesheet system using vuejs, sqlite, and electron. 

![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg?style=for-the-badge)
![](https://img.shields.io/github/issues/LionelKarlen/openjur?style=for-the-badge)
![](https://img.shields.io/badge/Electron-%5E13.0.0-brightgreen?style=for-the-badge)
## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes. For builds, please see the releases tab. 

### Prerequisites

Requirements for the software and other tools
- [yarn](https://github.com/yarnpkg/yarn) or [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [npx](https://www.npmjs.com/package/npx)

### Installing

A step by step series of examples that tell you how to get a development
environment running

Install dependencies

```
yarn install
```

Run the project locally
```
yarn electron:serve
```

## Running the tests

There are currently no tests other than style. Please run before opening a pull request.

### Style test

Checks if the best practices and the right coding style has been used.

```
yarn lint
```

To automatically fix style issues
```
yarn lint-write
```

## Contributing

Please read through the issues and comment on one you are interested in. Make sure you run the style tests before you submit a pull request.

## Versioning

We use [Semantic Versioning](http://semver.org/) for versioning. For the versions
available, see the [tags on this
repository](https://github.com/LionelKarlen/openjur/tags).
