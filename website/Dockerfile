#FROM is the base image for which we will run our application
FROM nginx:latest

# Copy files and directories from the application
COPY index.html /usr/share/nginx/html
COPY js/ /usr/share/nginx/html/js/

# Tell Docker we are going to use this port
EXPOSE 80