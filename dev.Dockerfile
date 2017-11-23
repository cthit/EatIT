# Dockerfile for EatIT in development
FROM debian:jessie
MAINTAINER digIT <digit@chalmers.it>

# Setup unprivileged user
RUN groupadd -r meteor && useradd -m -g meteor meteor

# Install prerequisites
RUN apt-get update && apt-get install -y \
curl locales grep


# Change ownership and su unprivileged user
RUN mkdir /app && chown -R meteor:meteor /app
USER meteor:meteor

# Install meteor
RUN curl https://install.meteor.com/ | sh
USER root:root
RUN cp /home/meteor/.meteor/packages/meteor-tool/1.6.0/mt-os.linux.x86_64/scripts/admin/launch-meteor /usr/bin/meteor

# Setup locales
RUN cat /usr/share/i18n/SUPPORTED | grep en_US >> /etc/locale.gen
RUN locale-gen en_US.UTF-8
RUN update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8

# Mount source files
VOLUME /app

# Switch to unprivileged user
USER meteor:meteor
WORKDIR /app

# Install dependencies and run!
CMD meteor npm install && meteor run
