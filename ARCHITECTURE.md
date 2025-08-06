# Food Ordering Platform - Architecture

## 🏗️ System Overview

The Food Ordering Platform is a real-time web application built with a modern microservices-inspired architecture, emphasizing clean separation of concerns and scalable design patterns.

## 📐 Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "Frontend Layer"
        NEXT[Next.js App]
        REDUX[Redux Store]
        WS_CLIENT[WebSocket Client]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx Proxy]
    end
    
    subgraph "Backend Services"
        EXPRESS[Express Server]
        RPC[JSON-RPC Handler]
        WS_SERVER[WebSocket Server]
        AUTH[Auth Middleware]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end
    
    subgraph "External Services"
        PAYMENT[Payment Gateway]
        NOTIFICATIONS[Push Notifications]
    end
    
    WEB --> NEXT
    MOBILE --> NEXT
    NEXT --> REDUX
    NEXT --> WS_CLIENT
    
    NEXT --> NGINX
    WS_CLIENT --> NGINX
    
    NGINX --> EXPRESS
    NGINX --> WS_SERVER
    
    EXPRESS --> RPC
    EXPRESS --> AUTH
    RPC --> POSTGRES
    RPC --> REDIS
    
    WS_SERVER --> POSTGRES
    WS_SERVER --> REDIS
    
    EXPRESS --> PAYMENT
    WS_SERVER --> NOTIFICATIONS
