# Test Documentation - Magic Transporters API

## Test Summary

**Total Test Suites:** 3  
**Total Tests:** 44  
**Status:** ✅ All Passing  
**Test Framework:** Jest + Supertest  
**Test Type:** End-to-End (E2E) Integration Tests

---

## Test Suites Overview

### 1\. Magic Items Test Suite (`magic-items.test.ts`)

**Tests:** 6  
**Focus:** CRUD operations for Magic Items

#### Test Cases Covered:

##### ✅ Basic CRUD Operations

*   **Create Magic Item**
    *   Successfully creates an item with valid name and weight
    *   Returns 201 status code
    *   Validates response structure contains `_id`, `name`, `weight`, timestamps

##### ✅ Validation Tests

**Missing Name Validation**

*   Returns 400 error when name is missing
*   Validates error message structure
*   Checks error location is `body`

**Missing Weight Validation**

*   Returns 400 error when weight is missing
*   Validates required field enforcement

**Invalid Weight Validation**

*   Returns 400 error for negative weight values
*   Ensures weight must be positive (>= 0.01)

##### ✅ Retrieval Operations

**Get All Items**

*   Returns 200 status code
*   Returns array of all items
*   Validates response structure

**Retrieve Created Items**

*   Verifies items persist in database
*   Checks all fields are returned correctly

---

### 2\. Magic Movers Test Suite (`magic-movers.test.ts`)

**Tests:** 20  
**Focus:** Mover lifecycle, item loading, mission management, validation

#### Test Cases Covered:

##### ✅ Mover Creation

*   **Create Magic Mover**
    *   Successfully creates mover with valid weight limit
    *   Returns 201 status code
    *   Initializes in `resting` state
    *   Sets `missionsCompleted` to 0
    *   Initializes empty items array

##### ✅ Validation Tests

**Missing Weight Limit**

*   Returns 400 error when weightLimit is missing
*   Validates required field enforcement

**Invalid Weight Limit**

*   Returns 400 for weight limit ≤ 0
*   Ensures weight limit must be positive (>= 1)

##### ✅ Item Loading

**Load Items Successfully**

*   Changes state from `resting` to `loading`
*   Associates items with mover
*   Returns updated mover with populated items

**Weight Limit Validation**

*   Returns 400 when total weight exceeds mover's weight limit
*   Validates atomic weight checking
*   Error message includes actual vs limit weights

**Loading While On Mission**

*   Returns 400 when attempting to load items during active mission
*   Prevents item loading in `on-mission` state
*   Maintains mission integrity

**Invalid Mover ID**

*   Returns 400 for malformed MongoDB ObjectId
*   Validates ID format before processing

**Non-existent Mover**

*   Returns 404 when mover doesn't exist
*   Proper error handling for missing resources

##### ✅ Mission Lifecycle

**Start Mission**

*   Transitions from `loading` to `on-mission`
*   Returns 200 status code
*   Maintains loaded items

**Start Mission Validation - No Items**

*   Returns 400 when starting mission without loaded items
*   Enforces strict state machine (must load items first)
*   Error: "Cannot start a mission from resting state"

**Start Mission Validation - Already On Mission**

*   Returns 400 when already on a mission
*   Prevents double-mission state
*   Error: "Mover is already on a mission"

**End Mission**

*   Transitions from `on-mission` to `resting`
*   Unloads all items (empties items array)
*   Increments `missionsCompleted` counter
*   Resets `currentWeight` to 0

**End Mission Validation - Not On Mission**

*   Returns 400 when not currently on mission
*   Error: "Mover is not currently on a mission"

##### ✅ Top Movers / Leaderboard

*   **Get Top Movers**
    *   Returns movers sorted by `missionsCompleted` (descending)
    *   Returns 200 status code
    *   Validates sorting order (most missions first)

---

### 3\. Full E2E Workflow Test Suite (`e2e-full-workflow.test.ts`)

**Tests:** 18  
**Focus:** Complete mission workflows, edge cases, activity logging, concurrent operations

#### Test Cases Covered:

##### ✅ Complete Mission Workflow

*   **Full Lifecycle Test**
    *   Create mover → Create items → Load items → Start mission → End mission
    *   Validates each state transition
    *   Verifies final state is correct

##### ✅ Weight Management

**Weight Limit Enforcement**

*   Creates mover with specific weight limit
*   Attempts to load items exceeding limit
*   Returns 400 with clear error message
*   Validates atomic weight checking prevents overloading

**Incremental Loading**

*   Supports loading items in multiple batches
*   Tracks cumulative weight correctly
*   State transitions properly between loading operations

##### ✅ State Machine Enforcement

**Strict State Transitions**

*   `resting` → can only load items
*   `loading` → can load more items OR start mission
*   `on-mission` → can ONLY end mission (no loading)
*   `on-mission` → back to `resting` after mission ends

**Invalid State Transitions**

*   Cannot start mission from `resting` (must load first)
*   Cannot load items while `on-mission`
*   Cannot end mission while `resting` or `loading`

##### ✅ Activity Logging

**State Transition Logging**

*   Creates log entry when loading items (`loading` action)
*   Creates log entry when starting mission (`on-mission` action)
*   Creates log entry when ending mission (`resting` action)
*   All logs contain correct mover reference

**Items Tracking in Logs** 

*   `loading` log contains items being loaded
*   `on-mission` log contains items being transported
*   `resting` log contains items that were delivered (fixed from empty array)
*   Validates complete mission history preservation

**Log Retrieval by Mover**

*   Fetches all logs for specific mover
*   Sorted by creation date (newest first by default)
*   Validates log count and sequence

##### ✅ Concurrent Operations & Race Conditions

**Duplicate Items Prevention**

*   Returns 422 when attempting to load duplicate items in same request
*   Error: "Cannot load duplicate items in the same request"
*   Validates `itemIds` array for duplicates

**Item Assignment Conflicts**

*   Returns 409 when items already assigned to another mover
*   Uses atomic operations to prevent race conditions
*   Error: "One or more items are already assigned to another mover"
*   Tests concurrent loading scenarios

**Atomic Weight Validation**

*   Weight check happens atomically with item assignment
*   Prevents race condition where multiple movers load same items
*   Rollback mechanism if operation fails

##### ✅ Error Handling

**Missing Items**

*   Returns 404 when item IDs don't exist
*   Error: "One or more Magic Items not found"

**Validation Errors**

*   Empty itemIds array returns 400
*   Malformed request bodies return 400
*   Detailed validation error messages

**Not Found Errors**

*   Non-existent mover returns 404
*   Non-existent items return 404

##### ✅ Data Integrity

**Item Reusability**

*   Items become available after mission ends
*   `assignedTo` field resets to `null`
*   Items can be loaded by different movers in subsequent missions

**Mission Counter**

*   `missionsCompleted` increments correctly
*   Persists across multiple missions
*   Used for leaderboard functionality

---

## Coverage by Feature

### ✅ Fully Tested Features

#### Magic Items

*   Create item with validation
*   Get all items
*   Field validation (name, weight)
*   Weight constraints (must be > 0)

#### Magic Movers

*   Create mover with validation
*   Get all movers
*   Get top movers (leaderboard)
*   Weight limit validation
*   Initial state setup

#### Item Loading

*   Load single item
*   Load multiple items
*   Incremental loading (multiple batches)
*   Weight limit enforcement
*   Duplicate detection
*   Conflict detection (item already assigned)
*   State transition to `loading`

#### Mission Management

*   Start mission validation
*   State transition to `on-mission`
*   Prevent loading during mission
*   End mission
*   Item unloading
*   Counter increment
*   State transition to `resting`

#### Activity Logs

*   Log creation on load
*   Log creation on start mission
*   Log creation on end mission
*   Items tracking in logs (including delivered items)
*   Log retrieval by mover ID
*   Log sorting

#### Concurrency & Race Conditions

*   Atomic weight validation
*   Atomic item assignment
*   Duplicate prevention
*   Conflict detection
*   Rollback mechanisms

#### Error Handling

*   Validation errors (400)
*   Not found errors (404)
*   Conflict errors (409)
*   Unprocessable entity (422)
*   Error message clarity

---

## Test Coverage Gaps (Not Tested)

### ⚠️ Features Not Covered by Current Tests

#### Filtering & Pagination

*   GET `/api/magic-items?available=true`
*   GET `/api/magic-items?minWeight=10&maxWeight=50`
*   GET `/api/magic-items?name=sword`
*   GET `/api/magic-movers?questState=on-mission`
*   GET `/api/magic-movers?minMissions=5&limit=10`
*   GET `/api/activity-logs?action=loading&limit=20`
*   Date range filtering on logs
*   Sorting parameters
*   Offset/pagination

#### Query Validation

*   Invalid filter values (e.g., `?limit=999`)
*   Invalid date formats
*   Invalid sort parameters
*   Type coercion (string to boolean, etc.)

#### Edge Cases

*   Loading 0 weight items
*   Very large weight values
*   Very long item names
*   Unicode/special characters in names
*   Maximum concurrent missions
*   Database connection failures

#### Update Operations

*   Update mover weight limit (not implemented)
*   Update item properties (not implemented)
*   Delete operations (not implemented)

---

## Test Data Patterns

### Valid Test Data

```typescript
// Valid Mover
{ weightLimit: 100 }

// Valid Item
{ name: "Enchanted Sword", weight: 15 }

// Valid Load Request
{ itemIds: ["mongoId1", "mongoId2"] }
```

### Invalid Test Data

```typescript
// Invalid Mover
{ weightLimit: 0 }      // Too small
{ weightLimit: -5 }     // Negative
{}                       // Missing field

// Invalid Item
{ name: "", weight: 10 }           // Empty name
{ name: "Sword", weight: -1 }      // Negative weight
{ name: "Sword" }                  // Missing weight

// Invalid Load Request
{ itemIds: [] }                    // Empty array
{ itemIds: ["invalid-id"] }        // Bad format
```

---

## Test Environment

### Database

*   **Type:** MongoDB (in-memory or test instance)
*   **Cleanup:** Database cleared before each test suite
*   **Isolation:** Each test has clean state

### Server

*   **Type:** Express.js application
*   **Environment:** Test mode
*   **Port:** Ephemeral (assigned by Supertest)

### Dependencies

*   **Jest:** Test runner and assertion library
*   **Supertest:** HTTP assertion library
*   **MongoDB Memory Server:** In-memory MongoDB for testing

---

## Running Tests

```
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- magic-items.test.ts

# Run in watch mode
npm test -- --watch
```

---

## Test Metrics

| Metric | Value |
| --- | --- |
| **Total Tests** | 44 |
| **Passing** | 44 (100%) |
| **Failing** | 0 |
| **Test Suites** | 3 |
| **Execution Time** | ~15 seconds |
| **Code Coverage** | Not measured (recommended to add) |

---

## Recommendations for Additional Testing

### High Priority

1.  **Add filter/pagination tests** for all GET endpoints
2.  **Add query validation tests** to verify express-validator rules
3.  **Add performance tests** for concurrent operations
4.  **Add code coverage reporting** (Istanbul/NYC)

### Medium Priority

1.  **Add integration tests** for Swagger documentation
2.  **Add tests for edge cases** (empty database, large datasets)
3.  **Add tests for invalid ObjectId formats** in all endpoints

### Low Priority

1.  **Add load testing** (Apache Bench, Artillery)
2.  **Add security tests** (SQL injection, XSS attempts)
3.  **Add API contract tests** (Pact or similar)

---

## Bug Fixes Validated by Tests

### ✅ Fixed: Activity Log Items Tracking

**Issue:** When a mission ended, the "resting" activity log had an empty `items` array instead of showing what items were delivered.

**Test:** `e2e-full-workflow.test.ts` - "should create activity logs for all state transitions"

**Before Fix:**

```typescript
expect(logs[2].items).toHaveLength(0); // ❌ Empty array
```

**After Fix:**

```typescript
expect(logs[2].items).toHaveLength(1); // ✅ Contains delivered items
expect(logs[2].items.map(id => id.toString())).toContain(item._id);
```

**Root Cause:** Activity log was created AFTER items were unassigned from mover.

**Solution:** Capture item IDs before unassigning, then pass to log creation.

---

## Conclusion

The Magic Transporters API has **comprehensive E2E test coverage** for core functionality including:

*   ✅ CRUD operations
*   ✅ Mission lifecycle management
*   ✅ State machine enforcement
*   ✅ Activity logging
*   ✅ Concurrency handling
*   ✅ Error scenarios

**All 44 tests pass**, validating that the API meets the specified requirements with robust error handling and data integrity.

The main gap is **filter/pagination testing**, which should be added to validate the newly implemented query functionality.