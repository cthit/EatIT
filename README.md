# EatIT 
A system for organizing food orders. Written in ReactJS and Meteor. 

### Features
* Allow people to online organize a food order (for pizza for example). 
* Summarizes same item orders 
* Easily shareable link to specific order.

### Physical requirements
* Phone

## Production
Use the automated [docker image](https://hub.docker.com/r/cthit/eatit/)

### Example compose file
```yml
version: '2.2'
services:
  eatit:
    image: eatit
    ports:
      - "80:8080"
    environment:
      ROOT_URL: https://example.org
      MONGO_URL: mongodb://db:27017
  db:
    image: mongo
```

## Development

### Software requirements
* docker
* docker-compose

### Setup
Run the following command:
1. `docker-compose up`

### Local production environment
You can compile and build the production image with your local codebase using:
`docker-compose -f prod.docker-compose up --build`