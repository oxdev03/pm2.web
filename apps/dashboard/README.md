# pm2.web - Dashboard

The Dashboard is a Next.js application built on the t3 stack, utilizing trpc for API calls and next-auth for authentication. It offers a range of actions, including real-time monitoring, process control, log viewing, and user access management. Additionally, it uses multiple charts for better data visualization.

## On Premise

### Prerequisites

- Node v18
- MongoDB Cluster (required for Restart/Shutdown/Delete functionality) / MongoDB Atlas
- Open Port 3000 or 80,443 (if you use a reverse proxy)

### Configuration

```bash
NEXTAUTH_SECRET=Generate using openssl rand -base64 32 or https://generate-secret.vercel.app/32
DB_URI=mongodb+srv://connecturi
NEXTAUTH_URL=http://localhost:3000
```

### Installation

1. Install the dependencies

   ```bash
   # from project root
   npm install
   ```

2. Create a `.env` file in the dashboard directory and add the following env variables

   ```bash
    DB_URI=mongodb+srv://connecturi
    NEXTAUTH_SECRET=Generate using openssl rand -base64 32 or https://generate-secret.vercel.app/32
    NEXTAUTH_URL=<Index URL of the dashboard eg. http://ip:3000>
   ```

3. Build the frontend

   ```bash
    npm run build:apps:dashboard
   ```

### Setup

You can start it using the following npm command:

```bash
# run from the project root
npm run start:apps:dashboard
```

To run the process in the background, you can use several tools such as PM2.

#### Run using PM2

This will start it using pm2. Furthermore, you can hide it from the process list through the dashboard.

```bash
# run from the project root
pm2 start npm --name "pm2.web-dashboard" -- run "start:apps:dashboard"
```

## Vercel & MongoDB Atlas

- MongoDB Atlas
- Vercel Account (free tier is sufficient)

### Configuration

```bash
NEXTAUTH_SECRET=Generate using openssl rand -base64 32 or https://generate-secret.vercel.app/32
DB_URI=mongodb+srv://connecturi
NEXTAUTH_URL=http://localhost:3000
```

#### MongoDB Atlas

1. Create a MongoDB Atlas account and create a new project.
2. Create a new cluster and select the free tier.
3. Create a new database user and save the username and password.
4. Add your IP address to the IP Access List or through a CIDR block.

### Setup

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oxdev03/pm2.web/tree/master&root-directory=apps/dashboard&env=DB_URI,NEXTAUTH_SECRET&demo-title=pm2.web&demo-description=pm2.web%20-%20Easily%20monitor%20your%20processes%2C%20control%20them%20with%20various%20actions%2C%20view%20logs%20and%20set%20up%20access%20controls%20for%20users%20using%20the%20dashboard&demo-url=https%3A%2F%2Fgithub.com%2Foxdev03%2Fpm2.web&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2Foxdev03%2Fpm2.web%2Fmaster%2Fassets%2Findex.jpeg)

1. Click the deploy button above and follow the instructions.
2. After it finishes deploying, configure the `<deployed-project>/settings>Build & Development Settings>Framework Preset` to **Next.js**.
3. Redeploy the page, and you're good to go!
