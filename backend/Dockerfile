# Use the official Node.js image as the base image
FROM node:26

# Set the working directory inside the container
WORKDIR /usr/src/app

RUN npm install -g yarn

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["sh", "-c", "yarn db:deploy && yarn start:prod"]
