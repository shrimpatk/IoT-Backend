# IoT Home Monitor - Backend

NestJS backend service handling real-time sensor data with GraphQL API and WebSocket subscriptions.

## System Architecture

```ascii
MQTT Broker → Node-RED → WebSocket → NestJS → GraphQL → Frontend
                  ↓
               InfluxDB
```

## Features

### Real-time Data Handling

- WebSocket connections for live sensor data
- GraphQL subscriptions for real-time updates
- Configurable data thottling

## Tech Stack

```
Core:
- NestJS
- GraphQL
- WebSocket
- TypeScript

Database:
- PostgresSQL

Authentication:
- JWT with refresh tokens
```
