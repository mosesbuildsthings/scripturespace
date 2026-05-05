# Contributing to Scripture Space

Thank you for your interest in contributing to Scripture Space! We welcome developers, designers, and community members to help us build a better platform for spiritual growth.

## Code of Conduct

Scripture Space is committed to fostering an inclusive, welcoming community. All contributors must:

- Be respectful and kind to others
- Value diverse perspectives and experiences
- Focus on constructive feedback
- Report harassment or violations to support@scripturespace.app

## Getting Started

### 1. Fork the Repository

```bash
git clone https://github.com/YOUR-USERNAME/scripture-space.git
cd scripture-space
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `perf/` — Performance improvements

### 3. Install Dependencies

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Make Changes

Follow the style guides below. Keep commits small and focused.

### 5. Test Your Changes

```bash
npm run build     # Test production build
npm run lint      # Check code quality (if configured)
```

Test on multiple devices:
- Mobile (375px viewport)
- Tablet (768px viewport)
- Desktop (1920px viewport)

### 6. Commit & Push

```bash
git add .
git commit -m "feat: add cool new feature"
git push origin feature/your-feature-name
```

**Commit message format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore

**Example:**
```
feat(prayer): add prayer reminder notifications

- Added daily prayer reminder option to Settings
- Stores reminder time in user profile
- Uses browser Notification API
- Adds UI toggle and time selector

Closes #123
```

### 7. Create a Pull Request

Go to https://github.com/scripture-space/scripture-space/pulls and open a PR with:

- **Title:** Clear, concise description
- **Description:** What changed and why
- **Screenshots:** Visual changes (if applicable)
- **Testing:** How you tested the changes
- **Checklist:** Verify your work

---

## Style Guides

### JavaScript/React

**Naming:**
```javascript
// Components: PascalCase
export default function UserProfile() { ... }

// Hooks: camelCase with "use" prefix
export function useAuthContext() { ... }

// Variables/functions: camelCase
const userEmail = user.email;
const formatDate = (date) => { ... }

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
```

**Formatting:**
- Use 2-space indentation
- Max line length: 100 characters
- Semicolons: always
- Quotes: double quotes for JSX, single for strings

**Component Structure:**
```javascript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function MyComponent({ prop1, prop2 }) {
  // State
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => { ... }, []);

  // Handlers
  const handleClick = () => { ... };

  // Render
  return (
    <div>...</div>
  );
}
```

### CSS / Tailwind

- Use Tailwind utility classes (don't write custom CSS)
- Use CSS variables for colors (e.g., `text-primary`)
- Mobile-first responsive design (`sm:`, `md:`, `lg:`)
- Group related utilities with comments

```jsx
<div className={cn(
  // Layout
  "flex items-center justify-between gap-4",
  // Spacing
  "px-4 py-2",
  // Styling
  "rounded-lg border bg-card text-foreground",
  // Responsive
  "md:px-6 lg:gap-8"
)}>
  ...
</div>
```

### SQL / Entities

- Entity names: PascalCase (User, Post, Group)
- Field names: snake_case (author_email, created_date)
- Array fields: plural (followers, likes)
- Object fields: singular (author_profile)

```json
{
  "name": "Post",
  "properties": {
    "author_email": {"type": "string"},
    "author_name": {"type": "string"},
    "content": {"type": "string"},
    "likes": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Emails of users who liked"
    }
  }
}
```

---

## File Organization

```
src/
├── pages/          # Full-page components (routes)
├── components/     # Reusable components
│   ├── layout/
│   ├── feed/
│   ├── bible/
│   ├── prayer/
│   ├── groups/
│   ├── profile/
│   ├── study/
│   ├── growth/
│   ├── shared/
│   ├── onboarding/
│   ├── settings/
│   ├── leader/
│   └── ui/
├── lib/            # Utilities, contexts
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
├── functions/      # Backend functions
├── entities/       # Database schemas
└── api/           # API client config
```

**When to create new files:**
- Component > 200 lines → split into smaller files
- Multiple related components → create a subfolder
- Reusable logic → extract to `hooks/` or `lib/`

---

## Testing

### Manual Testing Checklist

- [ ] Feature works on mobile, tablet, desktop
- [ ] No console errors or warnings
- [ ] Responsive design looks good
- [ ] User can undo/redo actions
- [ ] Loading states are shown
- [ ] Error states are handled
- [ ] Accessibility (keyboard navigation, screen readers)

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Chrome (Android)
- Mobile Safari (iOS)

---

## Performance Guidelines

- **Page Load:** Keep < 2 seconds
- **API Response:** Keep < 500ms
- **Images:** Optimize and lazy-load
- **Bundle:** Monitor with `npm run build`

**Tips:**
- Use React.lazy() for code splitting
- Use React Query for caching
- Memoize expensive computations (useMemo)
- Lazy-load images (next-gen formats)

---

## Documentation

Update docs if you:
- Add a new feature
- Change how something works
- Fix a bug (if not obvious)

**Files to update:**
- README.md (new features, big changes)
- ARCHITECTURE.md (structural changes)
- API.md (API changes)

---

## Reporting Issues

### Security Issues

**Do NOT open a public issue.** Email security@scripturespace.app with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Your contact info

### Bug Reports

Open an issue on GitHub with:
- Clear title and description
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots/videos (if visual)
- Browser, OS, device info

**Example:**
```markdown
## Bug: Prayer request count not updating

### Steps to Reproduce
1. Create a new prayer request
2. Have another user click "Praying"
3. Refresh the page

### Expected Behavior
Count should update to 1 in real-time

### Actual Behavior
Count stays at 0 until page refresh

### Screenshots
[Attach screenshot showing the issue]

### Environment
- Browser: Chrome 126
- OS: macOS
- Device: MacBook Pro 14"
```

### Feature Requests

Open an issue with:
- Clear title and description
- Why this feature is needed
- Proposed solution (optional)
- Examples or mockups (optional)

---

## Review Process

### What to Expect

1. **Automated Checks**
   - Code formatting
   - Build passes
   - No console errors

2. **Code Review**
   - Design & architecture
   - Performance implications
   - Test coverage
   - Documentation

3. **Feedback**
   - Constructive suggestions
   - Requests for clarification
   - Praise for good work!

4. **Approval & Merge**
   - Approved when all checks pass
   - Merged to main branch
   - Deployed automatically

### Review Guidelines for Reviewers

- Be respectful and encouraging
- Approve good PRs quickly
- Request changes only if necessary
- Explain **why**, not just **what**

---

## Release Process

1. **Version Bump**
   - Update `package.json` version
   - Follow semver: major.minor.patch

2. **Changelog**
   - Add entry to CHANGELOG.md
   - Link to PR & issue numbers

3. **Git Tag**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

4. **Deploy**
   - Base44 auto-deploys on git push
   - Announce on community channels

---

## Questions?

- **Docs:** https://docs.scripturespace.app
- **Issues:** https://github.com/scripture-space/scripture-space/issues
- **Email:** dev@scripturespace.app
- **Discord:** [Join our community](https://discord.gg/scripturespace)

---

**Thank you for contributing to Scripture Space!** Together, we're building a platform that helps millions grow in faith. 🙏