# CI/CD Pipeline Documentation

## Overview

This project uses a **3-tier branching strategy** with automated CI/CD pipelines:

```
development → staging → main (production)
```

Each branch has its own workflow with increasing strictness.

---

## Workflows Summary

| Workflow | Triggers | Purpose | Deployment |
|----------|----------|---------|------------|
| **Development CI** | Push/PR to `development` | Quick validation, catch obvious errors | No deployment |
| **Staging CI/CD** | Push/PR to `staging` | Rigorous testing, security checks | Preview deployment (optional) |
| **Production CI/CD** | Push/PR to `main` | Strictest validation, E2E tests | Production deployment |

---

## Workflow Comparison

### Development ([ci-development.yml](./ci-development.yml))
**Goal:** Fast feedback for developers

- ✅ Linting
- ✅ Type checking
- ✅ Build validation
- ⚠️ Tests (lenient - can fail)
- 📦 Artifact retention: 7 days

**Philosophy:** Catch errors early, but don't block development

---

### Staging ([ci-staging.yml](./ci-staging.yml))
**Goal:** Pre-production validation

- ✅ All development checks (stricter)
- ✅ Prisma schema validation
- ✅ Security audits
- ✅ Bundle size analysis
- ✅ Integration tests (separate job)
- 📦 Artifact retention: 14 days

**Philosophy:** Simulate production, catch integration issues

---

### Production ([ci-production.yml](./ci-production.yml))
**Goal:** Zero-defect deployment

- ✅ All staging checks (strictest)
- ✅ E2E tests (required)
- ✅ High/critical security vulnerabilities block deployment
- ✅ Multi-job workflow (validate → test → deploy)
- ✅ Health checks post-deployment
- 📦 Artifact retention: 30 days

**Philosophy:** Production must be bulletproof

---

## Understanding the Pipeline Flow

### 1. Feature Development
```bash
# Create feature branch from development
git checkout development
git pull origin development
git checkout -b feature/user-authentication

# Make changes, then push
git add .
git commit -m "Add user authentication"
git push origin feature/user-authentication

# Open PR to development
# → Development CI runs
# → If passes, merge to development
```

### 2. Staging Release
```bash
# Merge development into staging
git checkout staging
git pull origin staging
git merge development

# Push to staging
git push origin staging

# → Staging CI/CD runs
# → More thorough tests
# → Preview deployment (if configured)
```

### 3. Production Release
```bash
# Merge staging into main
git checkout main
git pull origin main
git merge staging

# Push to production
git push origin main

# → Production CI/CD runs
# → All jobs must pass
# → Automated deployment
# → Health checks
```

---

## Key Concepts Explained

### Jobs vs Steps

**Jobs:**
- Run in **parallel** by default
- Each job gets a **fresh virtual machine**
- Use `needs:` to create dependencies

**Steps:**
- Run **sequentially** within a job
- Share the same filesystem
- If one fails, job stops

**Example:**
```yaml
jobs:
  test:              # Job 1 (parallel)
    steps:
      - checkout    # Step 1 (sequential)
      - install     # Step 2 (runs after step 1)
      - test        # Step 3 (runs after step 2)

  deploy:            # Job 2 (parallel with 'test')
    needs: test      # UNLESS we add 'needs' - then waits for 'test'
    steps:
      - deploy
```

### Uses vs Run

**`uses:`** = Pre-built actions (like npm packages)
```yaml
- uses: actions/checkout@v4          # Download repo
- uses: actions/setup-node@v4        # Install Node.js
```

**`run:`** = Shell commands
```yaml
- run: npm install                    # Shell command
- run: npm test                       # Another shell command
```

### Environment Variables

**Global (for all jobs):**
```yaml
env:
  NODE_VERSION: '20.x'
```

**Job-specific:**
```yaml
jobs:
  build:
    env:
      ENVIRONMENT: production
```

**Step-specific:**
```yaml
- run: npm build
  env:
    NEXT_PUBLIC_API_URL: https://api.example.com
```

---

## Next Steps

### 1. Create Branches
```bash
# Create development branch
git checkout -b development
git push -u origin development

# Create staging branch
git checkout -b staging
git push -u origin staging

# Return to main
git checkout main
```

### 2. Set Up GitHub Secrets

Go to: `GitHub Repo → Settings → Secrets and variables → Actions → New repository secret`

**Required secrets:**
- `DATABASE_URL` - Production database connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `VERCEL_TOKEN` - Vercel deployment token (if using Vercel)

**Generate NextAuth secret:**
```bash
openssl rand -base64 32
```

### 3. Test the Pipeline

Push a change to development:
```bash
git checkout development
# Make a small change
git add .
git commit -m "test: Trigger CI pipeline"
git push

# Go to GitHub → Actions tab to watch it run!
```

### 4. Add Tests to Your Project

```bash
# Install testing framework
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### 5. Branch Protection Rules

Go to: `GitHub Repo → Settings → Branches → Add rule`

**For `development`:**
- ✅ Require status checks to pass (Development CI)
- ✅ Require branches to be up to date

**For `staging`:**
- ✅ Require status checks to pass (Staging CI/CD)
- ✅ Require pull request reviews (1 reviewer)

**For `main`:**
- ✅ Require status checks to pass (Production CI/CD)
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require linear history
- ✅ Include administrators (even you must follow rules!)

---

## Troubleshooting

### "npm ci" fails
- **Cause:** No `package-lock.json` or mismatch with `package.json`
- **Fix:** Run `npm install` locally and commit `package-lock.json`

### TypeScript errors in CI but not locally
- **Cause:** Different TypeScript versions or missing types
- **Fix:** Ensure your local Node.js version matches `NODE_VERSION` in workflows

### Build works locally but fails in CI
- **Cause:** Environment variables missing
- **Fix:** Add required secrets to GitHub Secrets

### Workflow not triggering
- **Cause:** Pushed to wrong branch or workflow syntax error
- **Fix:** Check GitHub Actions tab for errors, validate YAML syntax

---

## Learning Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [Vercel GitHub Integration](https://vercel.com/docs/git)

---

## Questions to Test Your Understanding

1. **Why do we use `npm ci` instead of `npm install` in CI?**
2. **What happens if the "validate" job fails in production workflow?**
3. **Why does production workflow have 3 jobs instead of 1?**
4. **What's the purpose of uploading artifacts?**
5. **When should you use `continue-on-error: true`?**

<details>
<summary>Click for answers</summary>

1. `npm ci` is faster, reproducible, and ensures exact versions from lock file
2. The "e2e-tests" and "deploy" jobs won't run (they need validation to pass)
3. Separation of concerns: validate code → test integration → deploy
4. Re-use builds across jobs, download for debugging, compliance/rollback
5. During development phase only - remove once feature is stable
</details>
