# Worker Features Update

## New Features Implemented

### 1. Extended Worker Roles
Added more worker roles based on issue categories:
- Plumber (water, plumbing issues)
- Electrician (electricity issues)
- Carpenter (maintenance, structural)
- Cleaner (cleaning issues)
- Security (security issues)
- **Pest Control** (pest control issues)
- **Elevator Technician** (elevator issues)
- **Civil Engineer** (structural & civil issues)
- **Other** (for any other type of work)

### 2. Accept/Reject Work Functionality
Workers can now:
- **Accept** work assignments (max 3 at a time)
- **Reject** work assignments they cannot do
- See new assignments in a separate "New Work Assignments" section
- Status changes:
  - Accept → Status changes to "in_progress", workerAccepted flag set
  - Reject → Status changes to "rejected", workerRejected flag set

### 3. Maximum Work Limit
- Workers can only accept **3 works at a time**
- Accept button is disabled when limit is reached
- Warning message shown when trying to accept more than 3 works
- Counter shows "X/3" active works

### 4. View Members Feature
- New "View Members" button in worker dashboard
- Opens dialog showing all workers grouped by their roles
- Displays:
  - Worker name
  - Mobile number
  - Grouped by role (Plumber, Electrician, etc.)

### 5. Enhanced Dashboard Stats
Three stat cards showing:
1. **New Assignments** - Work waiting for accept/reject
2. **Active Works (X/3)** - Currently accepted and in-progress work
3. **Completed** - Finished work count

### 6. Work Sections Reorganized
1. **New Work Assignments** - Requires accept/reject action
2. **Verified Work - Send Payment Details** - Ready for payment request
3. **Active Work (X/3)** - Currently working on (max 3)
4. **Completed Work** - All finished work with payment status

## Updated Files

### WorkerHome.tsx
- Added accept/reject handlers
- Added 3-work limit validation
- Added view members dialog
- Reorganized sections for better workflow
- Added new worker roles in join dialog

### WorkerServerPage.tsx
- Updated worker role labels
- Updated worker role icons
- Shows assigned work count per worker
- Supports all new worker roles

## Workflow

```
New Assignment → Worker Accepts (if < 3 active) → In Progress → Complete → Verified → Send Payment → Payment Received
                ↓
                Worker Rejects → Rejected (removed from worker's list)
```

## Data Flags
- `workerAccepted` - Boolean, true when worker accepts
- `workerRejected` - Boolean, true when worker rejects
- Work limit enforced by counting issues with `workerAccepted = true` and status not completed/verified

## UI Improvements
- Color-coded badges (Blue for New, Green for Verified, etc.)
- Disabled state for accept button when limit reached
- Clear work count indicators
- Organized sections for different work states
