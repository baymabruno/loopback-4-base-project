# NodeJs Loopback 4 Base Project

Project with the objective of serving as an initial structure with basic elements for the development of an API

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites

- [Node.js](https://nodejs.org/en/download/package-manager/) - version 8.9.x or higher

- [Git](https://git-scm.com/downloads) - version 2.x or higher

### Recommended

- [Visual Studio Code](https://code.visualstudio.com/Download) - Integrated Development Environment

- [LoopBack tools](https://loopback.io/doc/en/lb3/Installation.html) - The LoopBack 4 CLI is a command-line interface

## Installing

Clone repository

```
git clone https://github.com/baymabruno/loopback-4-base-project.git
```

Copy `.env.example` file to `.env` filling in the corresponding attributes

```
cp .env.example .env
```

Install dependencies

```
npm install
```

Start application

```
npm start
```

> Start application `development` mode using [nodemon](https://www.npmjs.com/package/nodemon)
>
> ```
> npm run dev
> ```

## .env

```
APP_ENVIRONMENT=
APP_OPEN_API_DISABLED=

HOST=
PORT=

DB_HOST=
DB_USER=
DB_PASS=

MAIL_HOST=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_TYPE=
MAIL_PORT=
```

# Project Structure

    .
    ├── data                     - Local database
    ├── node_modules             - Node libs
    ├── public                   - Static resources
    ├── src                      - Code files
    │   ├── __tests__            - Project tests
    │   ├── controllers          - Recieve requests and return responses
    │   ├── datasources          - Databases connections
    │   ├── models               - Entity and database models
    │   ├── repositories         - Connection between model classes and database
    │   ├── services             - Services class from business
    │   ├── specs                - Objetcs scpes from project (request, responses, authenticate...)
    │   ├── strategies           - Strategies class from business
    ├── .env                     - Enviroment variables system
    ├── LICENSE.md               - Enviroment variables system
    └── README.md                - Readme file from projet

# Authors

- Bruno Bayma - _Initial work_ - [BaymaBruno - github.com](https://github.com/baymabruno)

See also the list of [contributors](https://github.com/baymabruno/loopback-4-base-project/graphs/contributors) who participated in this project.

# License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# Todo List

- [ ] Tests
- [ ] Deployment document

# Framework

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
