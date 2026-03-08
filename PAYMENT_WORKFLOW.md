# Payment Workflow Implementation

## Overview
This implementation adds a complete payment workflow for issue completion, verification, and payment processing.

## Workflow Steps

### 1. Worker Marks Work as Complete
- Worker clicks "Mark as Completed" button
- Issue status changes to "completed"
- Issue disappears from worker's pending tasks
- Issue moves to verification queue

### 2. Verification Process

#### For Personal Issues:
- User sees completed work in "Verify Completed Work" section
- User clicks "Verify Completion" button
- Issue status changes to "verified"

#### For Common Issues:
- Admin sees completed work in "Verify Completed Work (Common Issues)" section
- Admin clicks "Verify Completion" button
- Issue status changes to "verified"

### 3. Payment Details Submission
After verification:
- Worker sees verified work in "Verified Work - Send Payment Details" section
- Worker can setup payment profile (UPI ID, QR Code, Mobile Number)
- Worker clicks "Send Payment Details" button
- Worker enters:
  - Work details description
  - Amount (₹)
  - Bill image upload
- Payment details sent to user (personal) or admin (common)

### 4. Payment Processing

#### For Personal Issues:
- User sees payment request in "Payment Requests" section
- User clicks "Pay Now" to view:
  - Work details
  - Amount
  - Bill image
- User clicks "Pay Now" to confirm payment
- Issue status changes to "verified" with paymentCompleted flag

#### For Common Issues:
- Admin sees payment request in "Payment Requests (Common Issues)" section
- Admin clicks "Pay Now" to view payment details
- Admin confirms payment
- Issue status changes to "verified" with paymentCompleted flag

### 5. Completed Work Section
- Fully completed work visible in all three dashboards:
  - **User**: "Completed Work" section shows all paid issues
  - **Admin**: "Completed Work" section shows all paid issues
  - **Worker**: "Completed Work" section shows all paid issues with payment status

## New Components

### 1. PaymentProfileDialog
- Location: `src/components/PaymentProfileDialog.tsx`
- Purpose: Worker payment profile management
- Fields:
  - UPI ID
  - Mobile Number
  - QR Code Image Upload

### 2. PaymentDetailsDialog
- Location: `src/components/PaymentDetailsDialog.tsx`
- Purpose: Worker sends payment request
- Fields:
  - Work Details (textarea)
  - Amount (number)
  - Bill Image Upload

### 3. PaymentRequestDialog
- Location: `src/components/PaymentRequestDialog.tsx`
- Purpose: User/Admin views and pays
- Displays:
  - Work details
  - Amount
  - Bill image
  - Pay Now button

## Updated Files

### 1. AuthContext.tsx
New functions:
- `savePaymentProfile(userId, profile)` - Save worker payment profile
- `getPaymentProfile(userId)` - Get worker payment profile
- `sendPaymentDetails(issueId, details)` - Attach payment details to issue
- `markPaymentComplete(issueId)` - Mark payment as completed

New storage:
- `PAYMENT_PROFILES` - Stores worker payment profiles

Issue fields added:
- `paymentDetails` - Contains work details, amount, bill image
- `paymentSent` - Boolean flag
- `paymentCompleted` - Boolean flag

### 2. WorkerHome.tsx
New sections:
- Payment Profile button in header
- "Verified Work - Send Payment Details" section
- "Completed Work" section

New features:
- Payment profile management
- Send payment details after verification
- View completed work with payment status

### 3. ProblemsPage.tsx (User)
New sections:
- "Payment Requests" - Shows pending payments
- "Verify Completed Work" - Shows work to verify
- "Completed Work" - Shows fully completed work

New features:
- Verify personal issue completion
- View and pay payment requests
- Track completed work

### 4. AdminProblemsPage.tsx
New sections:
- "Payment Requests (Common Issues)" - Shows pending payments
- "Verify Completed Work (Common Issues)" - Shows work to verify
- "Completed Work" - Shows fully completed work

New features:
- Verify common issue completion
- View and pay payment requests for common issues
- Track completed work

## Data Flow

```
Worker marks complete → Issue status: "completed"
                      ↓
User/Admin verifies → Issue status: "verified"
                      ↓
Worker sends payment details → Issue: paymentSent = true
                      ↓
User/Admin pays → Issue: paymentCompleted = true, status = "verified"
                      ↓
Visible in all "Completed Work" sections
```

## Status Values
- `waiting` - Initial state
- `read` - Admin/User has read
- `accepted` - Admin/User accepted
- `started` - Worker assigned
- `in_progress` - Work in progress
- `completed` - Worker marked complete (awaiting verification)
- `verified` - Verified by user/admin (can send payment details)
- `rejected` - Rejected by admin/user

## Payment Flags
- `paymentSent` - Worker has sent payment details
- `paymentCompleted` - User/Admin has paid

## UI Features
- Separate sections for different workflow stages
- Badge indicators for status
- Amount display in rupees (₹)
- Image upload for bills and QR codes
- Responsive dialogs for all interactions
- Toast notifications for all actions
