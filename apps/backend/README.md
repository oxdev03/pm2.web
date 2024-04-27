# pm2.web - Backend

The Backend is a simple Node.js application that uses the pm2 BUS API to communicate and monitor pm2 processes. It doesn't require any open ports, since it only saves data to the database, and events like restart, stop, and delete are relayed through the change stream of MongoDB.

## Prerequisites

- Node.js v18
- MongoDB Cluster
- PM2 (installed globally)

## Configuration

```bash
DB_URI=<MongoDB URI>
SERVER_NAME=used instead of the host name (optional)
```

## Installation

1. Install the dependencies

   ```bash
   # run from the project root
   npm install
   ```

2. Create a `.env` file in the `apps/backend` directory and add the following variables

   ```bash
   DB_URI=<MongoDB URI>
   ```

## Setup

You can start it using the following npm command:

```bash
# run from the project root
npm run start:apps:backend
```

To run the process in the background, you can use several tools such as PM2.

### Run using PM2

This will start it using pm2. Furthermore, you can hide it from the process list through the dashboard.

```bash
# run from the project root
pm2 start npm --name "pm2.web-daemon" -- run "start:apps:backend"
```
