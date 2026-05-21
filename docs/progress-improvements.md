# Progress Loading Improvements - Developer Guide

## Overview

This guide explains the improvements made to the progress loading system during email fetching in PyMail Analyser.

## Architecture

### Progress Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Backend (Python)                          │
│                                                                    │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────┐       │
│  │ IMAP Fetch  │ ──> │ Unsub Scan   │ ──> │ DNS Lookup  │       │
│  │   0-60%     │     │   60-75%     │     │  75-100%    │       │
│  └──────┬──────┘     └──────┬───────┘     └──────┬──────┘       │
│         │                   │                    │                │
│         └───────────────────┴────────────────────┘                │
│                             │                                     │
│                    Progress Events (NDJSON)                       │
│                             │                                     │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (TypeScript)                        │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    useAnalyze Hook                       │    │
│  │  • Receives progress events                             │    │
│  │  • Calculates percentage (logarithmic)                  │    │
│  │  • Estimates ETA                                        │    │
│  │  • Updates ScanProgress state                          │    │
│  └─────────────────────┬────────────────────────────────────┘    │
│                        │                                          │
│                        ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  LoadingScreen Component                 │    │
│  │  • Displays phase message                               │    │
│  │  • Shows progress bar                                   │    │
│  │  • Formats ETA                                          │    │
│  │  • Rotates tips                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

## Progress Event Types

### 1. IMAP Fetch Event
```typescript
{
  type: "progress",
  phase: "imap_fetch",
  fetched: number  // Current count of emails fetched
}
```

**Backend Logic:**
```python
should_report = (
    total <= 20 or                    # Every message for first 20
    (total <= 100 and total % 5 == 0) or  # Every 5 for 21-100
    total % 10 == 0                   # Every 10 for 100+
)
```

### 2. Unsubscribe Scan Event
```typescript
{
  type: "progress",
  phase: "unsub_scan",
  checked: number,  // Scanned count
  total: number     // Total to scan (max 30)
}
```

**Backend Logic:**
```python
# Report every single scan (max 30 targets)
if progress:
    progress({
        "type": "progress",
        "phase": "unsub_scan",
        "checked": scanned,
        "total": len(fallback_targets),
    })
```

### 3. DNS Lookup Event
```typescript
{
  type: "progress",
  phase: "dns_lookup",
  checked: number,  // Domains checked
  total: number     // Total domains
}
```

**Backend Logic:**
```python
should_report_dns = (
    dns_checked <= 20 or      # Every check for first 20
    dns_checked % 5 == 0      # Every 5 thereafter
)
```

## Progress Calculation Algorithm

### Phase Weights
```typescript
const FETCH_WEIGHT = 0.60;   // 60% of total progress
const UNSUB_WEIGHT = 0.15;   // 15% of total progress
const DNS_WEIGHT = 0.25;     // 25% of total progress
```

### Logarithmic Fetch Progress

The key innovation is using a **logarithmic approach** for the fetch phase to provide faster initial feedback:

```typescript
let fetchFraction;

if (current < 10) {
  // Phase 1: Rapid initial feedback (0-20% of fetch phase)
  // Shows 0-12% overall progress
  fetchFraction = Math.min(0.2, current / 50);
  
} else if (current < 50) {
  // Phase 2: Steady progress (20-50% of fetch phase)
  // Shows 12-30% overall progress
  fetchFraction = 0.2 + ((current - 10) / 40) * 0.3;
  
} else {
  // Phase 3: Realistic estimation (50-95% of fetch phase)
  // Shows 30-57% overall progress
  const estimated = Math.max(liveTotal, current * 1.15);
  fetchFraction = 0.5 + Math.min(0.45, (current / estimated) * 0.45);
}

const percentage = Math.round(fetchFraction * FETCH_WEIGHT * 100);
```

### Why Logarithmic?

**Problem with Linear:**
- With 1000 emails, the first email = 0.1% progress
- User sees no movement for first few seconds
- Creates perception that app is frozen

**Solution with Logarithmic:**
- First 10 emails always show visible progress (0-12%)
- Creates immediate user feedback
- Progress slows down naturally as more is processed
- More accurate representation of actual work done

### Visual Comparison

```
Linear Progress (OLD):
Email:     0    100   200   300   400   500   600   700   800   900   1000
Progress:  0%   7%    14%   21%   28%   35%   42%   49%   56%   63%   70%
           └─────────────────────────────────────────────────────────────┘
           Slow start, constant increments

Logarithmic Progress (NEW):
Email:     0    10    20    50    100   200   500   1000
Progress:  0%   12%   21%   30%   40%   47%   54%   57%
           └──┘└─────┘└────┘└────────┘└──────────┘└────────┘
           Fast      Medium        Slow (realistic)
```

## ETA Calculation

### Formula
```typescript
const computeEta = (
  startedAt: number | null,
  current: number,
  phaseTotal: number,
): number | null => {
  if (!startedAt || current <= 0 || phaseTotal <= 0) return null;
  
  const elapsedSec = (Date.now() - startedAt) / 1000;
  if (elapsedSec < 1.0) return null;  // Wait for meaningful data
  
  const ratePerItem = elapsedSec / current;
  const remainingItems = Math.max(0, phaseTotal - current);
  const remainingPhaseSec = ratePerItem * remainingItems;
  
  return Math.max(1, Math.round(remainingPhaseSec));
};
```

### Key Improvements
1. **Separate timers per phase**: Each phase has its own start time
2. **Minimum sample requirement**: Need 1 second of data before showing ETA
3. **Per-phase estimation**: Only estimates current phase, not future phases
4. **Smoothing**: Rounds to nearest second to avoid jitter

## State Management

### ScanProgress Interface
```typescript
interface ScanProgress {
  phase: "idle" | "counting" | "fetching" | "scanning" | "processing";
  total: number;           // Total emails in period
  current: number;         // Current items in active phase
  phaseTotal: number;      // Total items for active phase
  percentage: number;      // 0-100 unified progress
  etaSeconds: number | null;  // Estimated remaining seconds
}
```

### State Transitions
```
idle → fetching → scanning → processing → done (100%)
  ↑                                         ↓
  └─────────────── reset() ─────────────────┘
```

## Code Integration Points

### 1. Backend Event Emission
**File:** `pymail-api/services/analyzer.py`

```python
def analyze(self, progress: Optional[Callable[[dict], None]] = None):
    # ... IMAP fetch loop
    for msg in mailbox.fetch(...):
        total += 1
        should_report = (
            total <= 20 or 
            (total <= 100 and total % 5 == 0) or 
            total % 10 == 0
        )
        if progress and should_report:
            progress({
                "type": "progress", 
                "phase": "imap_fetch", 
                "fetched": total
            })
```

### 2. Frontend Event Handling
**File:** `pymail-webapp/app/hooks/useAnalyze.ts`

```typescript
if (event.type === "progress") {
  if (event.phase === "imap_fetch") {
    const current = event.fetched || 0;
    // Calculate fetchFraction using logarithmic approach
    const percentage = Math.round(fetchFraction * FETCH_WEIGHT * 100);
    setScanProgress({
      phase: "fetching",
      total: liveTotal,
      current,
      phaseTotal: liveTotal,
      percentage,
      etaSeconds: computeEta(fetchStartRef.current, current, estimated),
    });
  }
  // ... handle other phases
}
```

### 3. UI Rendering
**File:** `pymail-webapp/app/components/LoadingScreen.tsx`

```typescript
const getPhaseMessage = () => {
  switch (progress.phase) {
    case "fetching": return "Fetching emails from inbox...";
    case "scanning": return "Scanning for unsubscribe links...";
    case "processing": return "Checking domain reputation...";
  }
};

<Progress value={progress.percentage} className="w-full h-2" />
<span>{progress.percentage}%</span>
<span>{formatEta(progress.etaSeconds)}</span>
```

## Performance Considerations

### Backend
- **Event throttling**: Prevents overwhelming the stream with events
- **Adaptive cadence**: More frequent updates when it matters (small counts)
- **Efficient reporting**: Minimal overhead per progress check

### Frontend
- **Memoized calculations**: ETA computed once per update
- **Smooth state updates**: React batches setScanProgress calls
- **Optimized rendering**: LoadingScreen only re-renders on progress change

## Testing Scenarios

### Scenario 1: Small Inbox (< 20 emails)
```
Expected:
- Progress updates every single email
- Shows 0% → 12% very quickly
- Unsubscribe scan visible if applicable
- Total time: ~5-10 seconds
```

### Scenario 2: Medium Inbox (100 emails)
```
Expected:
- First 20: every email (0-8%)
- 21-100: every 5 emails (8-57%)
- Smooth progress curve
- Total time: ~30-60 seconds
```

### Scenario 3: Large Inbox (1000+ emails)
```
Expected:
- First 20: every email (0-4%)
- 21-100: every 5 emails (4-12%)
- 100+: every 10 emails (12-57%)
- Progress feels steady, not stuck
- Total time: 3-10 minutes
```

## Troubleshooting

### Progress appears stuck
- **Check**: Are progress events being emitted?
- **Verify**: Console logs in useAnalyze hook
- **Fix**: Ensure backend reporting logic is correct

### ETA wildly inaccurate
- **Check**: Is elapsedSec >= 1.0 before calculating?
- **Verify**: Current/phaseTotal ratio is reasonable
- **Fix**: Ensure phase timing starts correctly

### Progress jumps or goes backward
- **Check**: liveTotal should only increase
- **Verify**: Percentage calculation doesn't exceed 100
- **Fix**: Use Math.max() for liveTotal, Math.min() for fractions

## Future Enhancements

1. **Predictive ETA**: Use historical data to improve estimates
2. **Progress smoothing**: Animate transitions between percentage updates
3. **Phase-specific tips**: Show relevant tips per phase
4. **Cancellation support**: Allow users to cancel long-running scans
5. **Resume capability**: Save progress and resume interrupted scans

---

**Last Updated:** 2024
**Maintained by:** PyMail Analyser Team
