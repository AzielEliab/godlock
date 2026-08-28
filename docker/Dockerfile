FROM python:3.12-slim

WORKDIR /app
COPY pyproject.toml README.md LICENSE ./
COPY godlock ./godlock
RUN pip install --no-cache-dir .

EXPOSE 8080
ENV GODLOCK_HOME=/data
VOLUME ["/data"]

# Inside the container listen on all interfaces so the published port works.
# docker-compose binds that published port to 127.0.0.1 on the host only.
# The unpackaged CLI default remains 127.0.0.1.
CMD ["godlock", "serve", "--host", "0.0.0.0", "--port", "8080", "--data-dir", "/data"]
