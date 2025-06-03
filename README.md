# 📝 CollabEditor - Real-Time Collaborative Document Editor

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-NestJS%20%7C%20React%20%7C%20GraphQL-blue)
![WebSockets](https://img.shields.io/badge/Real--time-WebSockets-orange)
![License](https://img.shields.io/badge/License-UNLICENSED-red)

_A modern, real-time collaborative document editing platform showcasing advanced full-stack architecture_

</div>

## ✨ Key Features

🚀 **Real-Time Collaboration**

- Live cursor tracking with user identification
- Instant document synchronization using WebSockets
- Operational transformation for conflict-free editing

💬 **Smart Commenting System**

- Text selection-based commenting
- Real-time updates via GraphQL subscriptions
- Threaded discussions with optimistic updates

🎨 **Modern UI/UX**

- Responsive design with Mantine & Material-UI
- Document templates and management dashboard
- Auto-save functionality and user presence indicators

🔐 **Enterprise Security**

- JWT-based authentication with NestJS Guards
- Protected routes and secure API endpoints
- WebSocket authentication and CORS protection

## 🎯 Clever Technology Choices & Architecture

### 🔌 WebSocket Architecture - The Smart Choice

**Why Socket.IO over native WebSockets:**

- **Automatic fallbacks**: Long-polling when WebSockets are blocked
- **Room-based isolation**: Each document gets its own broadcast room
- **Built-in reconnection**: Exponential backoff for network resilience
- **Namespace separation**: Editor traffic isolated from other real-time features

**Clever Implementation:**

- Document-specific rooms prevent cross-contamination
- In-memory cursor tracking with automatic cleanup on disconnect
- Event-driven communication with named events for type safety

### 📡 GraphQL + REST Hybrid - Best of Both Worlds

**Strategic API Design:**

**GraphQL for Comments System:**

- **Real-time subscriptions** for live comment updates
- **Nested queries** for threaded comment structures
- **Optimistic updates** for instant UI feedback
- **Type safety** with auto-generated TypeScript types

**REST for Document Operations:**

- **File uploads** and binary data handling
- **Simple CRUD** operations with predictable caching
- **Health checks** and monitoring endpoints
- **Template management** with straightforward endpoints

**Why This Hybrid Approach:**

- GraphQL shines for complex, related data (comments, threads)
- REST excels for simple operations and file handling
- Leverages strengths of both paradigms

### 🛡️ NestJS Guards & Interceptors - Security & Performance Layers

**Authentication Guards - The Security Gatekeepers:**

- **JWT Guards** for REST endpoint protection
- **WebSocket Guards** for real-time connection security
- **Role-based guards** for document access control
- **Passport integration** for multiple auth strategies

**Smart Interceptors for Performance:**

- **Logging interceptors** for comprehensive audit trails
- **Transform interceptors** for consistent API responses
- **Cache interceptors** for frequently accessed documents
- **Error interceptors** for graceful failure handling

**Exception Filters - Bulletproof Error Handling:**

- **GraphQL exception filters** for subscription error management
- **WebSocket exception filters** for connection error recovery
- **HTTP exception filters** for REST API error normalization
- **Validation filters** using class-validator decorators

### ⚡ Operational Transformation - Conflict-Free Collaboration

**Why Quill.js Deltas:**

- **JSON-serializable operations** for easy transmission
- **Commutative transformations** - order doesn't matter
- **Intentionality preservation** - user intent maintained
- **Composable operations** for efficient batching

**Smart Conflict Resolution:**

- Client edits generate deltas
- Server broadcasts to document room
- Other clients apply transformations automatically
- Database stores delta history for audit trails

### 🏗️ Dual Storage Strategy - Performance + Persistence

**In-Memory for Real-Time:**

- Sub-10ms response times for live operations
- Cursor positions and user presence tracking
- Document state caching for active sessions

**MySQL for Persistence:**

- ACID compliance for data integrity
- Structured relationships between entities
- Backup and recovery capabilities
- Query optimization with proper indexing

### 🎨 Frontend Architecture - Component Composition

**State Management Strategy:**

- **React Context** for document operations
- **Apollo Client** for GraphQL state and caching
- **Local state** for UI interactions and optimistic updates

### 📊 Performance Optimizations

**Network Efficiency:**

- Delta compression - only changes transmitted
- WebSocket connection pooling per document
- Event batching for rapid changes
- Socket.IO compression for large payloads

**Memory Management:**

- Automatic cursor cleanup on disconnect
- LRU cache for frequently accessed documents
- Configurable connection limits
- Debounced auto-save (2-second intervals)

**Editor Performance:**

- Virtual scrolling for large documents
- Lazy loading of comment threads
- Optimistic UI updates for responsiveness

## 🚀 Technical Highlights

**Real-Time Data Flow:**

1. User edits → Quill generates delta → WebSocket broadcast
2. Other clients receive delta → Apply transformation → Update UI
3. Periodic save to MySQL for persistence

**Comment System Flow:**

1. Text selection → GraphQL mutation → Database storage
2. GraphQL subscription → Real-time broadcast → UI update
3. Threaded queries for nested comment structures

**Security Layers:**

- NestJS Guards validate JWT tokens and user permissions
- WebSocket authentication via handshake parameters
- Input validation using class-validator decorators
- CORS configuration for cross-origin protection

This architecture demonstrates advanced full-stack patterns, combining the best of real-time technologies, modern API design, and robust security practices.

---

<div align="center">

_Built with blood🩸 by the Team_

</div>
