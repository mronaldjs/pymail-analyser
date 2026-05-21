# Smart Sorting and Grouping - Technical Documentation

## Architecture Overview

The sorting and grouping system is implemented entirely on the **client-side** for instant responsiveness without additional server requests.

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Component                      │
│  • Manages sort/group state                                 │
│  • Passes config to child components                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├──────────────────────────────────────┐
                      │                                      │
                      ▼                                      ▼
        ┌─────────────────────────┐          ┌─────────────────────────┐
        │   SendersHeader         │          │    SendersList          │
        │  • SortingControls      │          │  • Groups senders       │
        │  • User controls        │          │  • Renders groups       │
        └─────────────────────────┘          │  • Collapsible headers  │
                                              └─────────────────────────┘
                                                         │
                                    ┌────────────────────┴────────────────┐
                                    │                                     │
                                    ▼                                     ▼
                        ┌────────────────────┐              ┌────────────────────┐
                        │  SendersListView   │              │  SendersGridView   │
                        │  (Table layout)    │              │  (Card layout)     │
                        └────────────────────┘              └────────────────────┘
```

## Core Utilities

### `senderSorting.ts`

Central utility module containing all sorting and grouping logic.

#### Type Definitions

```typescript
type SortField = 
  | "email_count" 
  | "spam_score" 
  | "open_rate" 
  | "sender_name" 
  | "sender_email" 
  | "spam_risk";

type SortDirection = "asc" | "desc";

type GroupBy = "none" | "spam_risk" | "domain" | "open_rate_range";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface GroupConfig {
  groupBy: GroupBy;
  sortWithinGroups: SortConfig;
}
```

#### Core Functions

##### `compareSenders(a, b, config)`
```typescript
// Compares two senders based on sort configuration
// Returns: negative if a < b, positive if a > b, 0 if equal
```

**Algorithm:**
1. Extract values for the sort field from both senders
2. Compare using appropriate method (numeric or string comparison)
3. Apply direction multiplier (-1 for descending)
4. Return comparison result

**Special Cases:**
- `spam_risk`: Maps to numeric values (high=3, medium=2, low=1, unknown=0)
- String fields: Use `localeCompare` for proper alphabetical sorting
- Numeric fields: Direct subtraction

##### `sortSenders(senders, config)`
```typescript
// Sorts an array of senders
// Returns: New sorted array (immutable)
```

**Implementation:**
```typescript
return [...senders].sort((a, b) => compareSenders(a, b, config));
```

**Performance:** O(n log n) time complexity using JavaScript's Timsort

##### `groupSenders(senders, config)`
```typescript
// Groups and sorts senders
// Returns: Map<string, SenderStats[]>
```

**Algorithm:**
1. If `groupBy === "none"`, return single group with sorted senders
2. Otherwise:
   - Create Map for groups
   - Iterate through senders, assign to appropriate group
   - Sort senders within each group
   - Sort groups by logical order
   - Return Map

**Grouping Logic:**

**By Risk Level:**
```typescript
const risk = sender.spam_risk || "unknown";
groupKey = risk === "high" ? "🔴 High Risk"
  : risk === "medium" ? "🟡 Medium Risk"
  : risk === "low" ? "🟢 Low Risk"
  : "⚪ Unknown Risk";
```

**By Domain:**
```typescript
const domain = extractDomain(sender.sender_email);
groupKey = `📧 ${domain}`;
```

**By Engagement:**
```typescript
groupKey = openRate === 0 ? "Never opened (0%)"
  : openRate < 10 ? "Rarely opened (1-9%)"
  : openRate < 25 ? "Seldom opened (10-24%)"
  : openRate < 50 ? "Sometimes opened (25-49%)"
  : openRate < 75 ? "Often opened (50-74%)"
  : "Frequently opened (75-100%)";
```

##### `computeGroupStats(senders)`
```typescript
// Calculates aggregate statistics for a group
// Returns: GroupStats object
```

**Calculated Metrics:**
```typescript
interface GroupStats {
  totalEmails: number;      // Sum of all email_count
  averageSpamScore: number; // Mean spam_score (rounded)
  averageOpenRate: number;  // Mean open_rate (rounded)
  senderCount: number;      // Number of senders
}
```

## Component Architecture

### SortingControls Component

**Location:** `app/components/SortingControls.tsx`

**Props:**
```typescript
interface SortingControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  groupBy: GroupBy;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
}
```

**Responsibilities:**
- Render dropdown for grouping selection
- Render dropdown for sort field selection
- Render button for sort direction toggle
- Emit events on user interaction

**UI Elements:**
1. **Group By Dropdown:** 180px wide, 4 options
2. **Sort By Dropdown:** 160px wide, 6 options
3. **Direction Button:** 36px square with arrow icon

### GroupHeader Component

**Location:** `app/components/GroupHeader.tsx`

**Props:**
```typescript
interface GroupHeaderProps {
  groupName: string;
  stats: GroupStats;
  isExpanded: boolean;
  onToggle: () => void;
}
```

**Features:**
- Click to expand/collapse
- Keyboard accessible (Enter/Space)
- Displays chevron icon (down when expanded, right when collapsed)
- Shows group statistics in header

**Layout:**
```
[Chevron] Group Name (X senders) | Y emails | Z avg spam | W% avg open
```

### SendersList Component

**Location:** `app/components/SendersList.tsx`

**Key State:**
```typescript
const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
  new Set(Array.from(groupedSenders.keys()))
);
```

**Logic Flow:**

1. **Apply Grouping & Sorting:**
   ```typescript
   const groupedSenders = groupSenders(senders, groupConfig);
   ```

2. **Handle No Grouping:**
   ```typescript
   if (groupConfig.groupBy === "none") {
     // Render without group headers
     return <SendersListView senders={allSenders} ... />;
   }
   ```

3. **Render Groups:**
   ```typescript
   Array.from(groupedSenders.entries()).map(([groupName, groupSenders]) => (
     <div key={groupName}>
       <GroupHeader ... />
       {isExpanded && <SendersListView senders={groupSenders} ... />}
     </div>
   ))
   ```

### Dashboard Component

**Location:** `app/components/Dashboard.tsx`

**State Management:**
```typescript
const [sortField, setSortField] = useState<SortField>("spam_score");
const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
const [groupBy, setGroupBy] = useState<GroupBy>("none");

const groupConfig: GroupConfig = {
  groupBy,
  sortWithinGroups: { field: sortField, direction: sortDirection },
};
```

**Data Flow:**
```
User selects sort/group → State updates → groupConfig changes → 
SendersList re-renders → groupSenders() called → UI updates
```

## Performance Considerations

### Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Sorting | O(n log n) | JavaScript Timsort |
| Grouping | O(n) | Single pass through senders |
| Group sorting | O(k * m log m) | k groups, m senders per group |
| Stats calculation | O(n) | Linear scan per group |

**Overall:** O(n log n) dominated by sorting

### Memory Usage

| Structure | Space | Description |
|-----------|-------|-------------|
| Original senders | O(n) | Input array |
| Sorted senders | O(n) | New array created |
| Grouped Map | O(n) | References to same objects |
| Expanded state | O(k) | Set of group names |

**Total:** O(n + k) where k << n

### Optimization Strategies

1. **Immutable Operations:** Using spread operator `[...senders]` creates new arrays, preventing unwanted mutations
2. **Lazy Rendering:** Only expanded groups render their content
3. **React Memoization:** Components can be wrapped with `React.memo()` if needed
4. **Stable Sorting:** JavaScript's sort is stable, preserving relative order for equal elements

## State Persistence

### Current Implementation

State is **not persisted**. Resets to defaults when:
- User disconnects
- Page refresh
- New analysis

### Future Enhancement: LocalStorage

```typescript
// Save preferences
const savePreferences = () => {
  localStorage.setItem('pymail-sort-preferences', JSON.stringify({
    sortField,
    sortDirection,
    groupBy,
  }));
};

// Load preferences
const loadPreferences = () => {
  const saved = localStorage.getItem('pymail-sort-preferences');
  if (saved) {
    const prefs = JSON.parse(saved);
    setSortField(prefs.sortField);
    setSortDirection(prefs.sortDirection);
    setGroupBy(prefs.groupBy);
  }
};
```

## Testing Scenarios

### Unit Tests (Utility Functions)

```typescript
describe('compareSenders', () => {
  it('should sort by email count ascending', () => {
    const a = { email_count: 100, ... };
    const b = { email_count: 200, ... };
    expect(compareSenders(a, b, { field: 'email_count', direction: 'asc' }))
      .toBeLessThan(0);
  });

  it('should sort by spam_risk descending', () => {
    const a = { spam_risk: 'high', ... };
    const b = { spam_risk: 'low', ... };
    expect(compareSenders(a, b, { field: 'spam_risk', direction: 'desc' }))
      .toBeGreaterThan(0);
  });
});

describe('groupSenders', () => {
  it('should group by risk level', () => {
    const senders = [
      { spam_risk: 'high', ... },
      { spam_risk: 'low', ... },
      { spam_risk: 'high', ... },
    ];
    const groups = groupSenders(senders, {
      groupBy: 'spam_risk',
      sortWithinGroups: { field: 'email_count', direction: 'desc' },
    });
    expect(groups.size).toBe(2);
    expect(groups.get('🔴 High Risk')).toHaveLength(2);
  });
});
```

### Integration Tests (Component Behavior)

```typescript
describe('SendersList with grouping', () => {
  it('should render groups when groupBy is set', () => {
    render(<SendersList groupConfig={{ groupBy: 'spam_risk', ... }} ... />);
    expect(screen.getByText(/High Risk/)).toBeInTheDocument();
  });

  it('should toggle group expansion on click', () => {
    render(<SendersList ... />);
    const header = screen.getByText(/High Risk/);
    fireEvent.click(header);
    expect(/* group content */).not.toBeVisible();
  });
});
```

### E2E Tests (User Flows)

```typescript
test('user can sort and group senders', async () => {
  // 1. Login and analyze inbox
  await login();
  
  // 2. Change grouping
  await page.selectOption('[aria-label="Group by"]', 'spam_risk');
  await page.waitForSelector('.group-header');
  
  // 3. Change sorting
  await page.selectOption('[aria-label="Sort by"]', 'email_count');
  
  // 4. Verify first group shows highest counts
  const firstGroup = await page.$('.group-header:first-child');
  const stats = await firstGroup.textContent();
  expect(stats).toContain('emails');
});
```

## Extending the System

### Adding a New Sort Field

1. **Add type:**
   ```typescript
   export type SortField = 
     | "email_count" 
     | "spam_score"
     | "my_new_field"; // Add here
   ```

2. **Add comparison logic:**
   ```typescript
   case "my_new_field":
     comparison = a.my_new_field - b.my_new_field;
     break;
   ```

3. **Add label:**
   ```typescript
   export function getSortFieldLabel(field: SortField): string {
     switch (field) {
       case "my_new_field": return "My New Field";
       // ...
     }
   }
   ```

4. **Update UI:**
   ```typescript
   const sortFields: SortField[] = [
     "email_count",
     "my_new_field", // Add to dropdown
   ];
   ```

### Adding a New Grouping Method

1. **Add type:**
   ```typescript
   export type GroupBy = "none" | "spam_risk" | "my_new_group";
   ```

2. **Add grouping logic:**
   ```typescript
   case "my_new_group": {
     groupKey = computeMyGroupKey(sender);
     break;
   }
   ```

3. **Add group ordering (if needed):**
   ```typescript
   if (groupBy === "my_new_group") {
     const order = ["Group A", "Group B", "Group C"];
     return order.indexOf(keyA) - order.indexOf(keyB);
   }
   ```

4. **Add label and update UI** (same as sort field)

## Debugging

### Common Issues

**Groups appear empty:**
- Check if group names match between grouping and ordering logic
- Verify `isExpanded` state includes the group name

**Sorting doesn't work:**
- Ensure field exists on `SenderStats` interface
- Check comparison logic returns correct sign

**Performance issues:**
- Profile with React DevTools
- Consider memoizing `groupSenders()` call with `useMemo`
- Check if re-renders are unnecessary

### Debug Logging

```typescript
// In groupSenders()
console.log('Grouping senders:', {
  groupBy,
  senderCount: senders.length,
  groupCount: groups.size,
  groups: Array.from(groups.keys()),
});

// In SendersList
console.log('Rendering groups:', {
  expandedCount: expandedGroups.size,
  expanded: Array.from(expandedGroups),
});
```

---

**Version:** 1.0.0
**Last Updated:** 2024
**Maintained by:** PyMail Analyser Team
