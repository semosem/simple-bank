# This small app is bootstrapped from scratch using a procedure here

    ```
    https://www.metachris.com/2021/04/starting-a-typescript-project-in-2021
    ```

## Requirements : local develoment 

* mongodb
* docker
* .env variables are used for port and mongo connection

    PORT=3000
    MONGO_URI='mongodb address url'


## Repository can be cloned from

    ```
    https://github.com/semosem/simple-bank.git

    ```

## Running app

cd into the cloned repository and run the following command

    ```
    docker-compose up
    
    ```

## Running the tests

Test is written inside src/test, to see all tests run

    ```
    npm run test

    ```

## Mainly Built using

* [Typescript]

## Authors

* **Sem Gebresilassie** - _Initial work_ -

## Inspiration

Implement a backend with an API for a simple bank. Required functionalities:

* create a bank account
* transfer funds between accounts
* account balance report
