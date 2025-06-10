## **Title: Guide to Deploying a Next.js 15 Project on AWS EC2 with Nginx and PM2**

### **Objective:**
This guide will walk you through deploying a Next.js 15 application to an AWS EC2 instance. We will use Nginx as a reverse proxy and PM2 to manage the application process, ensuring it remains active even if the server restarts.

### **Prerequisites:**
1.  An AWS account.
2.  Git installed on your local machine.
3.  Your Next.js project pushed to a Git repository (e.g., GitHub, GitLab).
4.  A terminal or command prompt on your computer (e.g., Terminal, PowerShell, CMD).

---

### **Step 1: Preparing the Local Project**

Before deploying, ensure your sensitive environment variables in the `.env` file are not committed to your Git repository.

1.  **Check your `.gitignore` file:**
    Open the `.gitignore` file at the root of your project and ensure the following lines are present. If not, add them. This prevents your secret environment variables from being pushed to source control.
    ```
    .env.local
    .env
    ```

2.  **Push the project to Git:**
    Push your latest changes to your Git repository.
    ```bash
    git add .
    git commit -m "Prepare for deployment"
    git push origin main
    ```

---

### **Step 2: Creating and Configuring the AWS EC2 Instance**

1.  **Launch an EC2 Instance:**
    *   Log in to the AWS Management Console and navigate to the **EC2** service.
    *   Click the **Launch Instance** button.
    *   **Name:** Give your instance a name (e.g., `chatbot-at-metrics-dashboard`).
    *   **Application and OS Images (AMI):** Select **Ubuntu** and choose `Ubuntu Server 22.04 LTS`. It's stable and widely used.
    *   **Instance type:** Select **t3.medium**.
    *   **Key pair (login):** Create a new Key Pair.
        *   Click `Create new key pair`.
        *   Enter a name (e.g., `chatbot-at-metrics-dashboard-server-key`).
        *   Select `RSA` and the `.pem` format, then click `Create key pair`.
        *   The `.pem` file will be downloaded. **This file is crucial, so store it securely.**
    *   **Network settings:** Click the `Edit` button.
        *   **Security group name:** Provide a name (e.g., `chatbot-at-metrics-dashboard-sg`).
        *   **Inbound security groups rules:** Add the following rules:
            *   **Rule 1 (SSH):**
                *   Type: `SSH`
                *   Source type: `My IP` (This is more secure as it only allows access from your current IP address).
            *   **Rule 2 (HTTP):**
                *   Type: `HTTP`
                *   Source type: `Anywhere` (So anyone can access your website).
            *   **Rule 3 (HTTPS):**
                *   Type: `HTTPS`
                *   Source type: `Anywhere` (For adding an SSL certificate later).
    *   Once everything is configured, click **Launch instance**.

---

### **Step 3: Connecting to the EC2 Instance**

1.  Go to your EC2 dashboard, select your instance, and copy its **Public IPv4 address**.

2.  Open your computer's terminal and navigate to the folder where you downloaded the `.pem` file.

3.  First, change the file's permissions (you only need to do this once):
    ```bash
    chmod 400 chatbot-at-metrics-dashboard.pem
    ```
    *(Replace `chatbot-at-metrics-dashboard` with the name of your downloaded file)*

4.  Now, connect to the server using SSH:
    ```bash
    ssh -i "chatbot-at-metrics-dashboard.pem" ubuntu@YOUR_PUBLIC_IP
    ```
    *(Replace `YOUR_PUBLIC_IP` with your instance's Public IP address)*

---

### **Step 4: Setting Up the Server Environment**

Once connected to the server, we need to install the necessary software to run a Next.js app.

1.  **Update the System Packages:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Install Node.js and npm (using NVM):**
    Using NVM (Node Version Manager) makes it easy to manage different versions of Node.js.
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    ```
    Verify the installation by running `node -v` and `npm -v`.

3.  **Install Nginx:**
    Nginx will act as our web server.
    ```bash
    sudo apt install nginx -y
    ```
    After installation, start Nginx and enable it to run on system boot:
    ```bash
    sudo systemctl start nginx
    sudo systemctl enable nginx
    ```

4.  **Install PM2 (Process Manager):**
    PM2 will run our Next.js app in the background and automatically restart it if the server reboots.
    ```bash
    npm install pm2 -g
    ```

---

### **Step 5: Deploying the Next.js Project**

1.  **Clone the Project from Git:**
    Clone your project from your Git repository using its URL.
    ```bash
    git clone https://github.com/your-username/your-repo.git
    ```
    Now, enter the project directory:
    ```bash
    cd your-repo-name
    ```

2.  **Create the Environment Variables (`.env`) File:**
    Since the `.env` file was not included in Git, we need to create it manually on the server.
    ```bash
    nano .env
    ```
    Now, copy all the variables from your local `.env` file and paste them here. For example:
    ```
    DATABASE_URL="your_database_url"
    NEXT_PUBLIC_API_KEY="your_api_key"
    ```
    To save the file, press `Ctrl+X`, then `Y`, and finally `Enter`.

3.  **Install Project Dependencies:**
    ```bash
    npm install
    ```

4.  **Build the Project:**
    This command creates an optimized production build of your Next.js app.
    ```bash
    npm run build
    ```

5.  **Start the Application with PM2:**
    ```bash
    pm2 start npm --name "chatbot-at-metrics-dashboard" -- start
    ```
    *   `--name "chatbot-at-metrics-dashboard"`: Sets a name for your application process.
    *   `-- start`: Runs the `start` script from your `package.json` file (which is `"start": "next start"`).

6.  **Set up the PM2 Startup Script:**
    This ensures that PM2 and your app will restart automatically on server reboot.
    ```bash
    pm2 startup
    ```
    This will output a command. Copy and paste that command back into the terminal and run it (it usually starts with `sudo env...`). Then, save your current process list:
    ```bash
    pm2 save
    ```

---

### **Step 6: Configuring Nginx as a Reverse Proxy**

Now, we'll configure Nginx to act as a reverse proxy, forwarding traffic from the public (port 80) to our Next.js application (running on port 3000).

1.  **Remove the Default Nginx Configuration:**
    ```bash
    sudo rm /etc/nginx/sites-enabled/default
    ```

2.  **Create a New Nginx Configuration File for Your App:**
    ```bash
    sudo nano /etc/nginx/sites-available/chatbot-at-metrics-dashboard
    ```
    *(Replace `chatbot-at-metrics-dashboard` with your project's name)*

3.  **Paste the Following Configuration:**
    Replace `YOUR_PUBLIC_IP_OR_DOMAIN` with your EC2 instance's Public IP or your domain name (if you have one).
    ```nginx
    server {
        listen 80;
        server_name YOUR_PUBLIC_IP_OR_DOMAIN;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Save the file with `Ctrl+X`, then `Y`, and `Enter`.

4.  **Activate the Configuration:**
    Create a symbolic link from `sites-available` to `sites-enabled`.
    ```bash
    sudo ln -s /etc/nginx/sites-available/chatbot-at-metrics-dashboard /etc/nginx/sites-enabled/
    ```

5.  **Test the Nginx Configuration:**
    ```bash
    sudo nginx -t
    ```
    If you see a message like `syntax is ok` and `test is successful`, you're good to go.

6.  **Restart Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

---

### **Step 7: Verifying the Deployment**

Open your web browser and navigate to your EC2 instance's Public IP Address:
`http://YOUR_PUBLIC_IP`

If you have followed all the steps correctly, you should now see your Next.js application live.

### **Conclusion and Next Steps**
Congratulations! You have successfully deployed your Next.js application on AWS EC2.

**What's Next:**
*   **Add a Custom Domain:** Purchase a domain and point its DNS settings to your EC2's IP address.
*   **Add an SSL Certificate (HTTPS):** Secure your site by adding a free SSL certificate using Let's Encrypt and Certbot.
*   **Set Up a CI/CD Pipeline:** Automate your deployment process using tools like GitHub Actions or Jenkins, so your site updates automatically on every push to your repository.

Good luck

---

## **Possible Errors**

### **<span style="color:red">ssh: connect to host 16.178.205.34 port 22: Connection timed out</span>**


This is a very common issue when first setting up an EC2 instance. The error `ssh: connect to host ... port 22: Connection timed out` is a networking error, not an authentication error.

It means your computer sent a request to connect, but the server at `16.178.205.34` never responded. 99% of the time, this is caused by the **AWS Security Group** (the virtual firewall) blocking your connection.

Let's troubleshoot this step-by-step.

### Most Likely Cause: Security Group Inbound Rules

The Security Group associated with your EC2 instance does not have a rule that allows incoming SSH traffic from your current IP address.

**How to Fix It:**

1.  **Go to the AWS EC2 Console:** Log in to your AWS account and navigate to the EC2 Dashboard.

2.  **Find Your Instance:** Click on **"Instances"** in the left-hand menu and select the instance you are trying to connect to.

3.  **Go to the Security Tab:** In the details panel at the bottom, click on the **"Security"** tab.

4.  **Click on the Security Group:** You will see a link to your security group (it will start with `sg-`). Click on it.
    

5.  **Edit Inbound Rules:** In the Security Group's details page, click the **"Edit inbound rules"** button.
    

6.  **Check/Add the SSH Rule:** You need a rule that looks like this:
    *   **Type:** `SSH`
    *   **Protocol:** `TCP`
    *   **Port Range:** `22`
    *   **Source:** This is the most important part.

    **Option A (Most Secure):** Set the **Source** to `My IP`. AWS will auto-detect your current public IP address and fill it in.
    *   **Important:** Your home or office IP address can change. If you used `My IP` during setup and your IP has changed since then, the rule will no longer work. You can just delete the old rule and add a new one with your current `My IP`.

    **Option B (For Troubleshooting - Less Secure):** To quickly test if this is the problem, set the **Source** to `Anywhere (0.0.0.0/0)`.
    

    *   **Warning:** Setting the source to `Anywhere` allows *any computer on the internet* to attempt to connect to your instance on port 22. While they still need your `.pem` key to get in, it's best practice to restrict this to only your IP address. Use this for testing, and then switch back to `My IP` once it's working.

7.  **Save Rules:** Click the **"Save rules"** button.

8.  **Try Connecting Again:** Wait about 30 seconds for the rule to apply, and then run your `ssh` command again in your terminal.
    ```bash
    ssh -i "ai-chatbot-metrics-dashboard.pem" ubuntu@16.178.205.34
    ```

#### Other Possible Causes (If the above doesn't work)

If you've confirmed the Security Group is correct and it's still not working, check these things:

1.  **Is the Instance Running?**
    *   In the EC2 Dashboard, check that your instance's **"Instance state"** is `running`. If it's `stopped` or `pending`, you won't be able to connect.

2.  **Are You Using the Correct Public IP?**
    *   Double-check that `16.178.205.34` is the **"Public IPv4 address"** listed for your instance and not the "Private IPv4 address". You can't connect to a private IP from the internet.

3.  **Local or Corporate Firewall:**
    *   Are you on a work or university network? They sometimes block outgoing connections on port 22. A quick way to test this is to try connecting using a different network, like your phone's mobile hotspot.

4.  **Network ACLs (NACLs):**
    *   This is a more advanced firewall layer. By default, it allows all traffic. Unless you have specifically configured it, it's unlikely to be the problem, but it's worth checking if all else fails. You can find this under **"Network & Security" -> "Network ACLs"** in the VPC dashboard.

Start with the **Security Group** fix. It is almost certainly the source of your `Connection timed out` error.