# Step 1: Build the app
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . ./

# Expose React's default port
EXPOSE 3000

# Command to run React development server
CMD ["npm", "start"]