# Shared Types

This directory contains shared type definitions that are used by both the client and server.

## Purpose

The purpose of this shared types directory is to:

1. **Maintain Type Consistency**: Ensure that the same types are used on both client and server to prevent type mismatches.
2. **Reduce Duplication**: Avoid duplicating type definitions in multiple places.
3. **Improve Maintainability**: When a type needs to be updated, it only needs to be changed in one place.

## Usage

### In Server Code

```typescript
import { MaintenanceTask } from '../../shared/types/maintenance.types';
```

### In Client Code

```typescript
import { MaintenanceTask } from '../../shared/types/maintenance.types';
```

## Available Types

### API Types (`api.types.ts`)

- `ApiResponse<T>`: Standard API response format
- `ApiError`: Error format for API responses
- `PaginationParams`: Parameters for paginated requests
- `PaginatedResponse<T>`: Response format for paginated data
- `SearchParams`: Parameters for search requests

### Maintenance Types (`maintenance.types.ts`)

- `MaintenanceTask`: Base maintenance task interface
- `CreateMaintenanceTaskInput`: Input for creating a new task
- `UpdateMaintenanceTaskInput`: Input for updating an existing task
- `MaintenanceTasksResponse`: Response for getting all tasks
- `MaintenanceTaskResponse`: Response for getting a single task
- `ToggleTaskCompletionInput`: Input for toggling task completion

## Adding New Types

When adding new types to this directory:

1. Create a new file with a descriptive name (e.g., `user.types.ts`)
2. Define interfaces and types that will be shared between client and server
3. Export all types that need to be used outside the file
4. Update this README to document the new types

## Best Practices

- Keep types focused on data structures, not UI or implementation details
- Use descriptive names that clearly indicate the purpose of each type
- Include JSDoc comments for complex types
- Use nullable types (e.g., `string | null`) instead of optional properties when appropriate
- Consider using utility types like `Partial<T>` and `Pick<T, K>` to create derived types 