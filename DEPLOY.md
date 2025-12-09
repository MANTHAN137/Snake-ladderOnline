# 🚀 Deployment Guide for Snake & Ladders Online

Since you have your repository ready at **[https://github.com/MANTHAN137/Snake-ladderOnline](https://github.com/MANTHAN137/Snake-ladderOnline)**, follow these exact steps to get your multiplayer game running live on the internet.

---

## Phase 1: Push Your Latest Changes ⚠️ IMPORTANT

You have made many changes locally (Scary Snake, Winner Screen, Server Port Fix) that might not be on GitHub yet. You need to upload these first.

1.  **Open your terminal** in the project folder (`c:\Users\HP\Downloads\Asteroid`).
2.  **Run these commands** to save your changes and upload them to your repository:

    ```bash
    # 1. Initialize git if you haven't (skip if you already have the .git folder)
    git init

    # 2. Link your local folder to your online repo
    git remote add origin https://github.com/MANTHAN137/Snake-ladderOnline.git
    # (If it says "remote origin already exists", that's fine, ignore it)

    # 3. Add all your new files
    git add .

    # 4. Save the changes
    git commit -m "Update game with scary snakes, winner screen, and server fix"

    # 5. Push to GitHub
    git branch -M main
    git push -u origin main
    # (If it asks for login, follow the prompts. If you get a 'conflict' error, you might need to run: git push -f origin main)
    ```

---

## Phase 2: Deploy on Render (Free)

We will use **Render.com** because it supports the **Node.js** server and **Socket.io** connection needed for multiplayer.

1.  **Create an Account**:
    *   Go to [dashboard.render.com/register](https://dashboard.render.com/register).
    *   Sign up using your **GitHub** account (this makes it easiest).

2.  **Create a New Web Service**:
    *   Click the **"New +"** button in the top right.
    *   Select **"Web Service"**.

3.  **Connect Your Repository**:
    *   You should see a list of your GitHub repos.
    *   Find **`Snake-ladderOnline`** and click **"Connect"**.
    *   *(If you don't see it, click "Configure account" on the right sidebar to give Render permission to see your repositories)*.

4.  **Configure the Settings**:
    Render will ask for some details. Fill them in exactly like this:

    *   **Name**: `snake-ladder-online` (or whatever you want)
    *   **Region**: `Singapore` (or `Frankfurt` - pick whatever is closest to you)
    *   **Branch**: `main`
    *   **Root Directory**: *(Leave Blank)*
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: `Free`

5.  **Deploy**:
    *   Scroll down and click **"Create Web Service"**.

---

## Phase 3: Play! 🎉

Render will now start building your app. It will take about 1-2 minutes.
*   Watch the logs on the page.
*   Once it says **"Server running on http://localhost:..."** (don't worry if it says localhost, that's just the log), look at the top left of the dashboard.
*   You will see a URL link like: **`https://snake-ladder-online.onrender.com`**.

**Click that link, share it with your friends, and play!**
