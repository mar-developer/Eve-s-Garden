---
name: docker-manage
description: Manage Docker containers for the flox-cloud project. Build, start, stop, restart, or check logs for services.
disable-model-invocation: true
argument-hint: "[action: up|down|restart|logs|build|status] [service?]"
---

Manage Docker services for flox-cloud: $ARGUMENTS

## Available compose files
- `docker-compose.yml` — Base configuration
- `docker-compose.dev.yml` — Development overrides
- `docker-compose.prod.yml` — Production overrides

## Actions

### status
```bash
docker-compose ps
```

### up (dev)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### down
```bash
docker-compose down
```

### restart [service]
```bash
docker-compose restart <service>
```

### logs [service]
```bash
docker-compose logs --tail=100 <service>
```

### build [service]
```bash
docker-compose build <service>
```

## Services in this project
- backend
- aggregator
- web-dashboard
- admin-console
- keycloak
- nginx
- db (PostgreSQL)
