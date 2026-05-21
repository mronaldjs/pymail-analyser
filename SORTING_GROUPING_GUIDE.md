# Smart Grouping and Sorting - User Guide

## Overview

The PyMail Analyser now includes powerful sorting and grouping capabilities that help you organize and analyze your email senders more effectively. This feature allows you to view your senders in different ways based on various criteria.

## Features

### 🔄 Sorting Options

Sort your senders by any of these fields:

1. **Email Count** - Total number of emails received from this sender
2. **Spam Score** - Risk score calculated by the analyzer
3. **Risk Level** - High, Medium, Low, or Unknown risk categorization
4. **Open Rate** - Percentage of emails you've opened from this sender
5. **Sender Name** - Alphabetically by sender name
6. **Email Address** - Alphabetically by email address

Each sort can be **ascending** (↑) or **descending** (↓).

### 📊 Grouping Options

Organize senders into logical groups:

1. **No Grouping** - Display all senders in a single list
2. **By Risk Level** - Group into High, Medium, Low, and Unknown risk categories
3. **By Domain** - Group by email domain (e.g., gmail.com, amazon.com)
4. **By Engagement** - Group by how often you open their emails:
   - Never opened (0%)
   - Rarely opened (1-9%)
   - Seldom opened (10-24%)
   - Sometimes opened (25-49%)
   - Often opened (50-74%)
   - Frequently opened (75-100%)

## How to Use

### Accessing Controls

1. After analyzing your inbox, look for the sorting controls in the "Top Offenders" section
2. You'll see two dropdown menus and direction buttons

### Sorting

1. Click the **"Sort by"** dropdown
2. Select your preferred sorting field
3. Click the arrow button (↑/↓) to toggle between ascending and descending order

**Example:** To see senders with the most emails first:
- Sort by: "Email Count"
- Direction: ↓ (descending)

### Grouping

1. Click the **"Group by"** dropdown
2. Select your preferred grouping method
3. Groups will appear with collapsible headers

**Example:** To focus on high-risk senders:
- Group by: "By Risk Level"
- Groups will be ordered: High → Medium → Low → Unknown

### Group Headers

When grouping is enabled, each group displays:
- **Group Name** with icon (🔴 for high risk, 📧 for domains, etc.)
- **Sender Count** - Number of senders in this group
- **Total Emails** - Combined email count for the group
- **Avg Spam Score** - Average spam score across senders
- **Avg Open Rate** - Average open rate percentage

Click any group header to **expand** or **collapse** it.

## Common Use Cases

### 1. Find Your Biggest Email Offenders
```
Group by: No Grouping
Sort by: Email Count
Direction: ↓ (descending)
```
**Result:** Shows senders who fill your inbox most, starting with the highest count.

### 2. Identify High-Risk Senders
```
Group by: By Risk Level
Sort by: Spam Score
Direction: ↓ (descending)
```
**Result:** Groups by risk with highest spam scores first in each group.

### 3. Review Unopened Marketing Emails
```
Group by: By Engagement
Sort by: Email Count
Direction: ↓ (descending)
```
**Result:** Shows which categories have the most unopened emails.

### 4. Audit Senders by Domain
```
Group by: By Domain
Sort by: Email Count
Direction: ↓ (descending)
```
**Result:** See which domains send you the most emails, grouped together.

### 5. Prioritize Unsubscribing
```
Group by: By Risk Level
Sort by: Email Count
Direction: ↓ (descending)
```
**Result:** Focus on high-risk senders with many emails to unsubscribe from first.

## Tips & Tricks

### 💡 Combine with Selection
- Select multiple senders within a group
- Use bulk actions (Archive/Delete) on selected senders
- Groups make it easy to select all high-risk senders at once

### 💡 Quick Navigation
- Groups start **expanded** by default
- Collapse groups you don't need to focus on specific categories
- Collapse all except one to focus on a single category

### 💡 Understanding Group Stats
- **Total Emails**: Helps identify which groups are filling your inbox
- **Avg Spam Score**: Higher average = riskier group overall
- **Avg Open Rate**: Lower percentage = emails you ignore

### 💡 Best Practices

1. **Start with Risk Level grouping** to identify dangerous senders
2. **Then switch to Domain grouping** to see which services dominate
3. **Use Engagement grouping** to find newsletters you never read
4. **Sort by Email Count** within groups to prioritize actions

## Visual Examples

### No Grouping
```
All Senders (150 senders)
├─ Sender A (250 emails)
├─ Sender B (180 emails)
├─ Sender C (120 emails)
└─ ...
```

### By Risk Level
```
🔴 High Risk (12 senders) | 450 emails | avg spam: 85 | avg open: 15%
├─ Suspicious Sender (150 emails)
└─ ...

🟡 Medium Risk (35 senders) | 800 emails | avg spam: 55 | avg open: 30%
├─ Newsletter X (120 emails)
└─ ...

🟢 Low Risk (103 senders) | 2500 emails | avg spam: 20 | avg open: 45%
└─ ...
```

### By Domain
```
📧 amazon.com (8 senders) | 450 emails | avg spam: 25 | avg open: 60%
├─ Amazon Marketing (250 emails)
├─ AWS Notifications (120 emails)
└─ ...

📧 linkedin.com (12 senders) | 380 emails | avg spam: 35 | avg open: 20%
└─ ...
```

### By Engagement
```
Never opened (0%) (45 senders) | 850 emails
├─ Daily Newsletter (120 emails)
└─ ...

Rarely opened (1-9%) (32 senders) | 620 emails
└─ ...

Often opened (50-74%) (18 senders) | 280 emails
└─ ...
```

## Technical Details

### Default Settings
- **Sort Field**: Spam Score
- **Sort Direction**: Descending (highest spam first)
- **Group By**: No Grouping

### Group Ordering Logic

**Risk Level**: High → Medium → Low → Unknown
- Prioritizes most dangerous senders

**Engagement**: Never → Rarely → Seldom → Sometimes → Often → Frequently
- Shows least engaging emails first

**Domain**: By total email count per domain (descending)
- Largest email sources appear first

### Performance
- Grouping and sorting are performed **client-side** (instant)
- No additional server requests needed
- Works with any number of senders

## Keyboard Shortcuts

When a group header is focused:
- **Enter** or **Space**: Expand/collapse the group
- **Tab**: Navigate to next group or control

## Accessibility

- All controls are keyboard accessible
- Screen readers announce group names and statistics
- High contrast mode supported
- Focus indicators for navigation

## FAQ

**Q: Can I save my sorting/grouping preferences?**
A: Currently, preferences reset when you disconnect. Saving preferences is planned for a future update.

**Q: Does grouping affect bulk actions?**
A: No, selections work across groups. You can select senders from multiple groups and perform bulk actions.

**Q: What happens when I change grouping with items selected?**
A: Your selections are preserved. Selected items remain selected in their new groups.

**Q: Can I sort groups themselves?**
A: Groups are automatically ordered by a logical sequence (see Group Ordering Logic above).

**Q: How are ties handled in sorting?**
A: When two senders have the same value for the sort field, they maintain their original relative order (stable sort).

## Future Enhancements

Planned features:
- [ ] Custom group creation
- [ ] Multi-level grouping (e.g., by risk, then by domain)
- [ ] Save and load presets
- [ ] Export grouped view to CSV
- [ ] Search within groups
- [ ] Advanced filters (date ranges, email count thresholds)

---

**Version:** 1.0.0
**Last Updated:** 2024
**Maintained by:** PyMail Analyser Team
