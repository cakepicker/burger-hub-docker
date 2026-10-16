# Burger Hub — Docker Setup

## Project Overview
Burger Hub is a website served using Nginx in a Docker container.

## Requirements
- Docker Desktop installed and running
- Git installed if cloning the project from GitHub

## Build the Docker Image
Open a terminal in the project folder and run:

```powershell
docker build -t burgerhub/week6 .
```

## Run the Container
```powershell
docker run -d --name burgerhub-app -p 8080:80 burgerhub/week6
```

Open the website in a browser:

http://localhost:8080

## Verify the Container
```powershell
docker ps
```

## View Logs
```powershell
docker logs burgerhub-app
```

## Stop the Container
```powershell
docker stop burgerhub-app
```

## Start It Again
```powershell
docker start burgerhub-app
```

## Remove the Container
Stop it first, then run:

```powershell
docker rm burgerhub-app
```

If the container name is already in use, remove the old container before creating another one.

## Troubleshooting
- If Docker commands cannot connect to the engine, open Docker Desktop and wait until it is running.
- If port 8080 is already in use, use another host port, for example `-p 8081:80`, and open `http://localhost:8081`.
- If the website does not load, check `docker ps` and `docker logs burgerhub-app`.
