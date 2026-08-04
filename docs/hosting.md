# Hosting on Firebase (Google Cloud)

The site is a pile of static files in `dist/`, so hosting it is genuinely simple. Firebase Hosting is part of Google
Cloud, uses the same project and billing account, and its free tier comfortably covers a site this size. It gives you
automatic SSL, a global CDN, atomic deploys, and instant rollback.

These steps need your Google account, so run them yourself.

## One time setup

**1. Install the Firebase CLI.**

```bash
npm install -g firebase-tools
```

**2. Sign in.** This opens a browser.

```bash
firebase login
```

**3. Point the repo at your project.** Replace the placeholder in `.firebaserc`, or run:

```bash
firebase use --add
```

**4. Enable Firebase on the GCP project**, if it isn't already. Firebase Hosting is an API on a normal GCP project:

```bash
gcloud services enable firebase.googleapis.com firebasehosting.googleapis.com
```

## Deploying by hand

```bash
npm run build && firebase deploy --only hosting
```

Preview a change before it goes live, on a temporary URL that expires in seven days:

```bash
npm run build && firebase hosting:channel:deploy preview
```

Roll back from the Firebase console, or:

```bash
firebase hosting:rollback
```

## Deploying from CI

`.github/workflows/firebase-deploy.yml` builds and deploys on every push to `main`. It needs two things set on the
GitHub repo.

**A repository variable** named `GCP_PROJECT_ID`, set to your project ID:

```bash
gh variable set GCP_PROJECT_ID --body "your-project-id"
```

**A repository secret** named `FIREBASE_SERVICE_ACCOUNT`, containing a service account key with the
`roles/firebasehosting.admin` role. The Firebase CLI can create both the account and the secret for you:

```bash
firebase init hosting:github
```

If you would rather do it manually, create the service account, grant it hosting admin, download a JSON key, and:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT < key.json
```

Then delete the local key file. A long-lived JSON key is the weak point of this setup. If you want to remove it,
Workload Identity Federation lets GitHub Actions authenticate to GCP with no stored key at all, using
`google-github-actions/auth`. Worth doing before this handles real user data.

## Custom domain

Add it in the Firebase console under Hosting, then create the DNS records it gives you. Certificates provision
automatically and usually take under an hour.

## Cost

Firebase Hosting's free Spark tier includes 10 GB stored and 360 MB/day transferred. The whole site is well under a
megabyte, so this is free until it is genuinely popular. The alternative GCP approach, a Cloud Storage bucket behind an
HTTPS load balancer, costs roughly $18/month for the load balancer alone whether or not anyone visits.

## The GitHub Pages workflow

`.github/workflows/deploy.yml` still publishes to GitHub Pages. Two things to know:

- Pages does not serve from private repositories on the free GitHub plan. Making the repo private takes that site down.
- Running both hosts means two public URLs for the same content, which is bad for search ranking and confusing to link.

Once Firebase is serving, delete `deploy.yml` so Firebase is the only host.
