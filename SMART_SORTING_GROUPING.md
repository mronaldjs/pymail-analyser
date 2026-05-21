# 🎯 Smart Sorting and Grouping Feature

## Overview

The PyMail Analyser now includes **intelligent sorting and grouping capabilities** to help you organize and analyze email senders more effectively. This client-side feature provides instant organization without additional server requests.

## ✨ Key Features

### Sorting Options
- **6 sortable fields:** Email Count, Spam Score, Risk Level, Open Rate, Sender Name, Email Address
- **Bidirectional sorting:** Ascending or Descending
- **Instant updates:** No loading, completely client-side

### Grouping Options
- **4 grouping methods:**
  - No Grouping (flat list)
  - By Risk Level (High/Medium/Low/Unknown)
  - By Domain (email provider)
  - By Engagement (how often you open emails)

### Interactive Group Headers
- **Collapsible groups** with expand/collapse
- **Group statistics:** Total emails, avg spam score, avg open rate
- **Visual indicators:** Emojis for quick identification (🔴 🟡 🟢 📧)

## 🚀 Quick Start

### For Users

1. **Analyze your inbox** as usual
2. **Look for sorting controls** in the "Top Offenders" section
3. **Select grouping method** from "Group by" dropdown
4. **Select sort field** from "Sort by" dropdown
5. **Toggle direction** with the arrow button (↑/↓)
6. **Click group headers** to expand/collapse

### Common Workflows

**Find spam sources:**
```
Group by: By Risk Level
Sort by: Email Count
Direction: ↓ (descending)
```

**Review unopened newsletters:**
```
Group by: By Engagement  
Sort by: Email Count
Direction: ↓ (descending)
Focus on: "Never opened (0%)" group
```

**Identify biggest email offenders:**
```
Group by: No Grouping
Sort by: Email Count
Direction: ↓ (descending)
```

## 📊 Benefits

| Benefit | Description |
|---------|-------------|
| **Better Organization** | See senders grouped logically instead of a flat list |
| **Faster Decision Making** | Quickly identify which senders to unsubscribe/delete |
| **Risk Prioritization** | Focus on high-risk senders first |
| **Domain Insights** | Understand which email providers dominate your inbox |
| **Engagement Analysis** | Find newsletters you never read |
| **Instant Response** | No waiting for server—all client-side |

## 📁 Files Created/Modified

### New Files
- `pymail-analyser/pymail-webapp/utils/senderSorting.ts` - Core sorting/grouping logic
- `pymail-analyser/pymail-webapp/app/components/SortingControls.tsx` - UI controls
- `pymail-analyser/pymail-webapp/app/components/GroupHeader.tsx` - Collapsible group headers

### Modified Files
- `pymail-analyser/pymail-webapp/app/components/SendersList.tsx` - Grouping support
- `pymail-analyser/pymail-webapp/app/components/SendersHeader.tsx` - Added sorting controls
- `pymail-analyser/pymail-webapp/app/components/Dashboard.tsx` - State management

## 🎨 UI Components

### Sorting Controls
```
[Group by: v] [By Risk Level v]  [Sort by: v] [Email Count v] [↓]
```

### Group Header (Expanded)
```
[v] 🔴 High Risk (12 senders) | 450 emails | avg spam: 85 | avg open: 15%
    [Sender list appears here]
```

### Group Header (Collapsed)
```
[>] 🟡 Medium Risk (35 senders) | 800 emails | avg spam: 55 | avg open: 30%
```

## 🔧 Technical Details

### Architecture
- **Pure client-side** - No backend changes required
- **Instant updates** - React state-driven
- **Efficient algorithms** - O(n log n) sorting, O(n) grouping
- **Immutable operations** - No mutations, clean data flow

### Performance
- **Handles 1000+ senders** smoothly
- **Lazy rendering** - Only expanded groups render content
- **Stable sorting** - Preserves order for equal elements
- **Minimal re-renders** - Optimized React updates

### Default Configuration
```typescript
sortField: "spam_score"      // Start with spam score
sortDirection: "desc"         // Highest scores first
groupBy: "none"              // No grouping initially
```

## 📚 Documentation

- **User Guide:** [`SORTING_GROUPING_GUIDE.md`](./SORTING_GROUPING_GUIDE.md)
- **Technical Docs:** [`docs/sorting-grouping-technical.md`](./docs/sorting-grouping-technical.md)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sort by each field (ascending and descending)
- [ ] Group by each method
- [ ] Expand/collapse groups
- [ ] Verify group statistics accuracy
- [ ] Test with small inbox (<20 senders)
- [ ] Test with large inbox (>500 senders)
- [ ] Verify selections persist across grouping changes
- [ ] Test keyboard navigation

### Automated Testing
```bash
# Unit tests for utilities
npm test utils/senderSorting

# Component tests
npm test components/SortingControls
npm test components/GroupHeader
npm test components/SendersList

# Integration tests
npm test e2e/sorting-grouping
```

## 🎯 Use Cases

### 1. Security Audit
**Goal:** Identify and remove high-risk senders
```
Group by: By Risk Level
Sort by: Spam Score
Action: Focus on "🔴 High Risk" group, delete/archive dangerous senders
```

### 2. Inbox Cleanup
**Goal:** Unsubscribe from unwanted newsletters
```
Group by: By Engagement
Sort by: Email Count
Action: Review "Never opened (0%)" group, unsubscribe from top senders
```

### 3. Domain Analysis
**Goal:** Understand which services send the most emails
```
Group by: By Domain
Sort by: Email Count
Action: Review top domains, decide which to filter/unsubscribe
```

### 4. Alphabetical Review
**Goal:** Systematically review all senders
```
Group by: No Grouping
Sort by: Sender Name
Direction: Ascending
Action: Go through senders A-Z methodically
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Save preferences** - Remember sorting/grouping across sessions
- [ ] **Custom groups** - User-defined grouping criteria
- [ ] **Multi-level grouping** - Group by risk, then by domain
- [ ] **Presets** - Quickly switch between saved configurations
- [ ] **Export grouped view** - Download as CSV with groups
- [ ] **Search within groups** - Filter senders in specific groups
- [ ] **Advanced filters** - Date ranges, email count thresholds
- [ ] **Batch group operations** - Archive/delete entire groups
- [ ] **Group comparisons** - Compare stats across groups

### Contribution Ideas
Want to contribute? Consider:
- Adding new sort fields (e.g., last received date)
- Creating new grouping methods (e.g., by sender type: newsletter/notification/personal)
- Improving group statistics (median, percentiles)
- Adding visualization (charts for group stats)

## 🤝 Contributing

To add a new sort field:
1. Update `SortField` type in `senderSorting.ts`
2. Add comparison logic in `compareSenders()`
3. Add label in `getSortFieldLabel()`
4. Update UI dropdown options

To add a new grouping method:
1. Update `GroupBy` type in `senderSorting.ts`
2. Add grouping logic in `groupSenders()`
3. Add ordering logic (if needed)
4. Add label in `getGroupByLabel()`
5. Update UI dropdown options

See [technical documentation](./docs/sorting-grouping-technical.md#extending-the-system) for detailed steps.

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Initial implementation
- ✅ 6 sort fields supported
- ✅ 4 grouping methods
- ✅ Collapsible group headers
- ✅ Group statistics
- ✅ Keyboard accessibility
- ✅ Responsive design

---

## 📞 Support

For issues or questions:
1. Check the [User Guide](./SORTING_GROUPING_GUIDE.md)
2. Review [Technical Documentation](./docs/sorting-grouping-technical.md)
3. Open an issue on GitHub
4. Contact the maintainers

**Made with ❤️ by the PyMail Analyser Team**
