# Native WebView — Implementation Examples

Quick reference for adding native-style features to your pages.

---

## Example 1: Add NativeSelect to a Form

```jsx
import { NativeSelect } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';

export default function MyForm() {
  const [category, setCategory] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Category</Label>
        <NativeSelect 
          value={category}
          onChange={setCategory}
          label="Select a category"
        >
          <option value="">Choose...</option>
          <option value="bible_study">Bible Study</option>
          <option value="prayer">Prayer</option>
          <option value="worship">Worship</option>
        </NativeSelect>
      </div>
    </div>
  );
}
```

**Features:**
- Desktop: Standard dropdown ✓
- Mobile: Bottom sheet modal ✓
- 44x44px touch targets ✓
- Keyboard-friendly ✓

---

## Example 2: Add Pull-to-Refresh to a Page

```jsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function MyPage() {
  const queryClient = useQueryClient();

  // Data fetching
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list(),
  });

  // Pull-to-refresh
  const { isRefreshing } = usePullToRefresh(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    'main' // container selector
  );

  return (
    <main className="overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isRefreshing && (
          <div className="text-center text-xs text-muted-foreground mb-4">
            Refreshing...
          </div>
        )}
        
        {items.map(item => (
          <div key={item.id} className="mb-4">
            {/* Item content */}
          </div>
        ))}
      </div>
    </main>
  );
}
```

**Features:**
- Swipe down to refresh ✓
- Visual feedback (text + spinner) ✓
- Works on iOS & Android ✓
- No elastic bounce ✓

---

## Example 3: Add BackButton to a Child Page

```jsx
import BackButton from '@/components/shared/BackButton';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DetailPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <BackButton variant="ghost" />
        <h1 className="text-xl font-bold flex-1">Details</h1>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Your content */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Features:**
- Shows only on mobile child screens ✓
- Hidden on desktop ✓
- 44x44px tap target ✓
- Automatic back navigation ✓

---

## Example 4: Complete Form with All Features

```jsx
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import BackButton from '@/components/shared/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

export default function CreateGoal() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await base44.entities.Goal.create({
        ...form,
        user_email: (await base44.auth.me()).email,
      });
      toast.success('Goal created!');
      window.history.back();
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton variant="ghost" />
        <h1 className="text-xl font-bold flex-1">New Goal</h1>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create a spiritual goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text input */}
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="E.g., Read Bible daily"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="min-h-[2.75rem]"
              />
            </div>

            {/* Native selects */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <NativeSelect
                  value={form.category}
                  onChange={c => setForm({ ...form, category: c })}
                  label="Select category"
                >
                  <option value="">Choose...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <NativeSelect
                  value={form.priority}
                  onChange={p => setForm({ ...form, priority: p })}
                  label="Select priority"
                >
                  {PRIORITIES.map(prio => (
                    <option key={prio.value} value={prio.value}>
                      {prio.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 min-h-[2.75rem]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 min-h-[2.75rem]"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Features:**
- Back button for mobile ✓
- Multiple native selects ✓
- 44x44px minimum buttons ✓
- Form validation & error handling ✓
- Responsive grid layout ✓

---

## Example 5: List Page with Pull-to-Refresh

```jsx
import { useState, useEffect } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BackButton from '@/components/shared/BackButton';
import { Loader2 } from 'lucide-react';

export default function GoalsList() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.email],
    queryFn: () => 
      user 
        ? base44.entities.Goal.filter({ user_email: user.email })
        : Promise.resolve([]),
    enabled: !!user,
  });

  const { isRefreshing } = usePullToRefresh(
    () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    'main'
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton variant="ghost" />
        <h1 className="text-xl font-bold flex-1">My Goals</h1>
      </div>

      {/* Content */}
      <main className="overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No goals yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <div 
                key={goal.id}
                className="p-4 border rounded-lg bg-card"
              >
                <h3 className="font-medium">{goal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.category} · {goal.priority}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

**Features:**
- Pull-to-refresh support ✓
- React Query integration ✓
- Loading states ✓
- Empty state messaging ✓
- Proper scrolling container ✓

---

## Migration Checklist

For each page you want to enhance:

- [ ] Import NativeSelect from `@/components/ui/native-select`
- [ ] Replace all `<select>` elements with `<NativeSelect>`
- [ ] Import BackButton from `@/components/shared/BackButton`
- [ ] Add BackButton to page header (on child/detail pages)
- [ ] Import usePullToRefresh from `@/hooks/usePullToRefresh`
- [ ] Add pull-to-refresh to scrollable `<main>` container
- [ ] Ensure all buttons are 44x44px minimum
- [ ] Test on mobile (iOS + Android)
- [ ] Test on desktop (verify graceful degradation)
- [ ] Check Lighthouse accessibility score

---

## Common Patterns

### Pattern: Form + List Page

```jsx
// Parent page: MyItems
<Link to="/MyItems/Create">
  <Button>+ Add Item</Button>
</Link>

// Child page: CreateMyItem
<BackButton />
<Form onSubmit={() => navigate(-1)} />
```

### Pattern: Details + Edit

```jsx
// Details page
const [isEditing, setIsEditing] = useState(false);

{isEditing ? (
  <EditForm onSave={() => setIsEditing(false)} />
) : (
  <Details onEdit={() => setIsEditing(true)} />
)}
```

### Pattern: Tab with Refresh

```jsx
const { isRefreshing } = usePullToRefresh(() => {
  queryClient.invalidateQueries({ queryKey: ['tabData'] });
}, 'main');

// Show refresh indicator
{isRefreshing && <Spinner />}
```

---

## Next Steps

1. Choose a page to enhance
2. Follow Example 4 as a template
3. Test on mobile device
4. Verify all tap targets are 44x44px
5. Check Lighthouse performance score
6. Roll out to other pages

For detailed documentation, see `WEBVIEW_NATIVE_OPTIMIZATION.md`.