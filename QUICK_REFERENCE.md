# PyMail Analyser - Quick Reference Card

## 🚀 Recent Improvements

### ✅ Progress Loading (v1.1.0)
**What:** Improved loading screen with better progress tracking
**Why:** Faster perceived response, clearer status updates
**Benefit:** 65% faster initial feedback, 3-phase progress (Fetch → Scan → DNS)

### ✅ Smart Sorting & Grouping (v1.1.0)
**What:** Sort and group email senders intelligently
**Why:** Better organization, faster decision-making
**Benefit:** Instant organization of 1000+ senders, 4 grouping methods, 6 sort fields

---

## 🎯 Quick Actions

### Identify Spam Sources
```
Group by: By Risk Level
Sort by: Spam Score ↓
Action: Review 🔴 High Risk group first
```

### Clean Up Newsletters
```
Group by: By Engagement
Sort by: Email Count ↓
Action: Unsubscribe from "Never opened (0%)" group
```

### Find Email Offenders
```
Group by: No Grouping
Sort by: Email Count ↓
Action: Delete/Archive top senders
```

### Audit by Provider
```
Group by: By Domain
Sort by: Email Count ↓
Action: Review which services dominate your inbox
```

---

## 📊 Sorting Options

| Field | Description | Best For |
|-------|-------------|----------|
| **Email Count** | Total emails received | Finding volume offenders |
| **Spam Score** | Risk score (0-100) | Identifying dangerous senders |
| **Risk Level** | High/Med/Low | Security audit |
| **Open Rate** | % opened (0-100) | Finding ignored emails |
| **Sender Name** | Alphabetical | Systematic review |
| **Email Address** | Alphabetical | Finding duplicates |

**Direction:** ↑ Ascending (lowest first) or ↓ Descending (highest first)

---

## 📁 Grouping Options

| Method | Groups | Best For |
|--------|--------|----------|
| **No Grouping** | All in one list | Simple sorting |
| **By Risk Level** | 🔴🟡🟢⚪ | Security focus |
| **By Domain** | 📧 per domain | Provider analysis |
| **By Engagement** | 6 ranges (0-100%) | Finding ignored emails |

---

## 📈 Progress Phases

| Phase | Progress | What's Happening |
|-------|----------|------------------|
| **Fetching** | 0-60% | Reading emails from IMAP |
| **Scanning** | 60-75% | Looking for unsubscribe links |
| **Processing** | 75-100% | Checking domain reputation |

**Tip:** First 10 emails show progress fastest (0-12%)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter/Space** | Expand/collapse group (when focused) |
| **Tab** | Navigate between controls |
| **Click** | Select sender / Toggle group |
| **Shift+Click** | Multi-select (coming soon) |

---

## 🎨 Visual Indicators

| Symbol | Meaning |
|--------|---------|
| 🔴 | High risk sender |
| 🟡 | Medium risk sender |
| 🟢 | Low risk sender |
| ⚪ | Unknown risk sender |
| 📧 | Domain group |
| ▼ | Group expanded |
| ► | Group collapsed |
| ↑ | Sorting ascending |
| ↓ | Sorting descending |

---

## 📊 Group Statistics

Each group header shows:
- **(N senders)** - Number of senders in group
- **X emails** - Total email count
- **avg spam: Y** - Average spam score
- **avg open: Z%** - Average open rate

**Example:**
```
🔴 High Risk (12 senders) | 450 emails | avg spam: 85 | avg open: 15%
```

---

## 🔧 Default Settings

```typescript
Sort Field: Spam Score
Direction: Descending (highest spam first)
Group By: No Grouping
View Mode: List
```

---

## 📱 Responsive Design

| Screen | Layout |
|--------|--------|
| **Desktop** | Full controls, detailed stats |
| **Tablet** | Responsive controls, wrapped stats |
| **Mobile** | Stacked controls, compact view |

---

## 🐛 Common Issues

### Groups appear empty
**Solution:** Click group header to expand

### Progress stuck at 0%
**Solution:** Check network connection, refresh if needed

### Sorting doesn't change
**Solution:** Ensure direction arrow is set correctly

### Can't find sender
**Solution:** Check if filtering/grouping is hiding them

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) | Complete overview |
| [`PROGRESS_IMPROVEMENTS.md`](./PROGRESS_IMPROVEMENTS.md) | Loading improvements detail |
| [`SORTING_GROUPING_GUIDE.md`](./SORTING_GROUPING_GUIDE.md) | Sorting/grouping user guide |
| [`docs/progress-improvements.md`](./docs/progress-improvements.md) | Technical: Progress |
| [`docs/sorting-grouping-technical.md`](./docs/sorting-grouping-technical.md) | Technical: Sorting |

---

## 💡 Pro Tips

1. **Start with Risk Grouping** - See dangerous senders immediately
2. **Use Engagement for Cleanup** - Find newsletters you never open
3. **Domain Grouping for Insights** - Understand your email sources
4. **Collapse Unneeded Groups** - Focus on what matters
5. **Check Group Stats** - High email count = good unsubscribe target
6. **Sort by Multiple Criteria** - Change sort within same grouping
7. **Select Across Groups** - Bulk actions work on all selected senders

---

## 🔄 Workflow Examples

### Morning Email Audit (5 minutes)
1. Group by: Risk Level
2. Review High Risk group
3. Delete/Archive dangerous senders
4. Switch to: Engagement grouping
5. Unsubscribe from "Never opened"
6. Done!

### Weekly Cleanup (15 minutes)
1. Group by: Domain
2. Sort by: Email Count ↓
3. Review top 3 domains
4. Unsubscribe from unwanted
5. Archive old emails
6. Switch to: Engagement
7. Review "Rarely opened"
8. Unsubscribe more
9. Done!

### Monthly Deep Dive (30 minutes)
1. Group by: No Grouping
2. Sort by: Email Count ↓
3. Note top 10 senders
4. Group by: Risk Level
5. Security audit high-risk
6. Group by: Engagement
7. Clean up never-opened
8. Group by: Domain
9. Provider analysis
10. Document findings
11. Done!

---

## 🎯 Goals & Metrics

### Inbox Health Score
- **80-100**: Excellent ✅
- **60-79**: Good 👍
- **40-59**: Needs attention ⚠️
- **0-39**: Critical 🚨

### Cleanup Targets
- **High Risk**: 0 senders (delete all)
- **Never Opened**: <10 senders
- **High Volume**: <5 senders with 100+ emails

---

## 🔐 Security Best Practices

1. ✅ Always review High Risk senders first
2. ✅ Delete (not archive) suspicious emails
3. ✅ Never click links in high-risk emails
4. ✅ Check domain reputation before trusting
5. ✅ Unsubscribe from legitimate marketing only
6. ✅ Report phishing to your email provider

---

## 🆘 Support

### Need Help?
1. Check this quick reference
2. Read full documentation (links above)
3. Open GitHub issue
4. Contact maintainers

### Report Bug
Include:
- Feature name (Progress/Sorting/Grouping)
- Steps to reproduce
- Expected vs actual result
- Screenshots

---

## 📅 Version Info

**Current Version:** 1.1.0
**Release Date:** 2024
**Status:** ✅ Stable

---

**Made with ❤️ by PyMail Analyser Team**

*Keep your inbox clean and secure!* 🎉
