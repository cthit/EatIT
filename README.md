# EatIT 
A system for organizing food orders. Written in ReactJS and Meteor. 

### Features
* Allow people to online organize a food order (for pizza for example). 
* Summarizes same item orders 
* Easily shareable link to specific order.

### Physical requirements
* Phone

## Production
Use the automated [docker image](ghcr.io/cthit/eatit:latest)

### Example compose file
```yml
services:
  db:
    image: mongo:4.4.6
    networks:
    - default
    restart: unless-stopped

  eatit:
    image: ghcr.io/cthit/eatit:latest
    environment: 
      ROOT_URL: https://eatit.chalmers.it
      MONGO_URL: mongodb://db:27017
    restart: unless-stopped

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
