# Progress Loading Recognition Improvements

## Summary
This document outlines the improvements made to the percentage loading recognition during the email fetching process in the PyMail Analyser application.

## Changes Made

### 1. Backend Improvements (Python - `analyzer.py`)

#### **More Granular Progress Updates**
- **IMAP Fetch Phase**:
  - Every message for the first 20 emails (immediate feedback for small inboxes)
  - Every 5 messages up to 100 emails (smooth progress for medium inboxes)
  - Every 10 messages beyond 100 (avoiding stream saturation for large inboxes)
  - **Before**: Updates every 10 emails after the first 50
  - **After**: More responsive with adaptive granularity

- **Unsubscribe Scan Phase**:
  - Now reports every scan operation (capped at 30 max, so never too many events)
  - **Before**: Updates every 5 scans after the first 10
  - **After**: Every single scan for better visibility

- **DNS Lookup Phase**:
  - Reports every check for the first 20 domains
  - Every 5 domains thereafter
  - **Before**: Every single check
  - **After**: Optimized to reduce unnecessary updates while maintaining responsiveness

### 2. Frontend Improvements (TypeScript - `useAnalyze.ts`)

#### **Enhanced Phase Weights**
The progress bar is now divided into three distinct phases:
- **Fetch Phase**: 0-60% (was 0-70%)
- **Unsubscribe Scan Phase**: 60-75% (NEW - was not tracked)
- **DNS/VirusTotal Lookup Phase**: 75-100% (was 70-100%)

#### **Improved Progress Calculation Algorithm**
- **Logarithmic Early Progress**: Shows faster movement in the first few emails
  - First 10 emails: 0-12% (20% of fetch phase)
  - 10-50 emails: 12-30% (50% of fetch phase)
  - Beyond 50 emails: 30-57% (remaining 45% based on estimation)
- **Better ETA Estimation**: 
  - Requires at least 1 second of data (was 0.5s)
  - Cleaner calculation without unused variables
  - Per-phase timing for more accurate estimates

#### **New Unsubscribe Scan Phase Tracking**
- Added dedicated progress tracking for the unsubscribe link scanning phase
- Shows phase name: "Scanning for unsubscribe links..."
- Displays progress: "X of Y messages scanned"
- Contributes 15% to the overall progress bar

### 3. UI Improvements (TypeScript - `LoadingScreen.tsx`)

#### **Enhanced Phase Messages**
- Added new phase: "Scanning for unsubscribe links..." 
- Improved progress details with number formatting (e.g., "1,234 emails")
- Shows "of ~X emails" when total is estimated during fetch phase

#### **Better Progress Bar Logic**
- Only shows determinate progress bar when percentage > 0
- Handles the new "scanning" phase properly
- Maintains indeterminate animation for "counting" phase

### 4. Type System Updates (`api.ts`)

- Added `unsub_scan` event type to `ScanProgressEvent`
- Added `scanning` phase to `ScanProgress` interface
- Updated documentation for progress percentage weights

## Benefits

1. **More Responsive**: Users see progress updates much faster, especially in the first few seconds
2. **Better Accuracy**: Three-phase progress tracking gives a more accurate representation of the work being done
3. **Improved UX**: The unsubscribe scanning phase is now visible, so users understand what's happening
4. **Smoother Progress**: Logarithmic calculation prevents the progress bar from getting "stuck" at low percentages
5. **Better ETA**: More reliable time estimates with improved calculation logic

## Technical Details

### Progress Formula (Fetch Phase)
```
if current < 10:
  fetchFraction = min(0.2, current / 50)
else if current < 50:
  fetchFraction = 0.2 + ((current - 10) / 40) * 0.3
else:
  estimated = max(liveTotal, current * 1.15)
  fetchFraction = 0.5 + min(0.45, (current / estimated) * 0.45)
```

### ETA Calculation
```
elapsedSec = (currentTime - startTime) / 1000
ratePerItem = elapsedSec / current
remainingItems = phaseTotal - current
eta = ratePerItem * remainingItems
```

## Testing Recommendations

1. **Small Inbox (<20 emails)**: Verify immediate progress updates
2. **Medium Inbox (20-100 emails)**: Check smooth progress increments every 5 emails
3. **Large Inbox (>100 emails)**: Ensure progress updates every 10 emails without lag
4. **With Unsubscribe Scanning**: Verify the "scanning" phase appears and progresses correctly
5. **ETA Accuracy**: Monitor if the estimated time remaining is reasonably accurate

## Files Modified

- `pymail-analyser/pymail-api/services/analyzer.py`
- `pymail-analyser/pymail-webapp/app/hooks/useAnalyze.ts`
- `pymail-analyser/pymail-webapp/app/components/LoadingScreen.tsx`
- `pymail-analyser/pymail-webapp/types/api.ts`
