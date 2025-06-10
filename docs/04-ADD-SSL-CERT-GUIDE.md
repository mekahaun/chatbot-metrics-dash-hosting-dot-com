## **Title: How to Add a Free SSL Certificate (HTTPS) with Let's Encrypt and Certbot**

### **Prerequisites**

1.  **A Registered Domain Name:** You must own a domain name (e.g., `yourdomain.com`). You cannot get an SSL certificate for a raw IP address.
2.  **DNS Records Pointing to Your EC2:** You must have an `A` record in your domain's DNS settings that points your domain (and the `www` subdomain) to your EC2 instance's **Public IPv4 address**.
    *   **`A` Record for `yourdomain.com` -> `YOUR_EC2_PUBLIC_IP`**
    *   **`A` Record for `www.yourdomain.com` -> `YOUR_EC2_PUBLIC_IP`**
    *(This step is done at your domain registrar, like GoDaddy, Namecheap, etc. DNS changes can take some time to propagate.)*
3.  **Ports 80 and 443 Open:** In your EC2 Security Group, ensure you have inbound rules allowing traffic on both `HTTP` (Port 80) and `HTTPS` (Port 443) from `Anywhere`. You should have already done this in the initial setup guide.

---

### **Step 1: Update Nginx Configuration for Your Domain**

First, we need to tell Nginx to listen for requests for your domain name, not just the IP address.

1.  SSH into your EC2 instance.

2.  Open your Nginx configuration file for editing:
    ```bash
    sudo nano /etc/nginx/sites-available/your-project-name
    ```
    *(Use the same project name you used when creating the file.)*

3.  Find the `server_name` line and replace the IP address with your actual domain name. It should look like this:
    ```nginx
    server {
        listen 80;
        # Replace the IP with your domain and the www version
        server_name yourdomain.com www.yourdomain.com;

        location / {
            proxy_pass http://localhost:3000;
            # ... rest of the configuration remains the same
        }
    }
    ```

4.  Save the file (`Ctrl+X`, then `Y`, then `Enter`).

5.  Test the Nginx configuration to make sure there are no syntax errors:
    ```bash
    sudo nginx -t
    ```
    If it says `syntax is ok` and `test is successful`, you can proceed.

6.  Restart Nginx to apply the changes:
    ```bash
    sudo systemctl restart nginx
    ```

### **Step 2: Install Certbot**

Certbot is the tool that automates the process of getting and renewing Let's Encrypt SSL certificates. The recommended way to install it on Ubuntu is using `snap`.

1.  Install `snapd` if it's not already installed (it usually is on Ubuntu 22.04).
    ```bash
    sudo snap install core; sudo snap refresh core
    ```

2.  Install Certbot:
    ```bash
    sudo snap install --classic certbot
    ```

3.  Prepare the Certbot command by creating a symbolic link. This ensures Certbot can be run from anywhere.
    ```bash
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    ```

### **Step 3: Obtain and Install the SSL Certificate**

Now for the magic part. Certbot's Nginx plugin will automatically find your domain from your Nginx config, get the certificate, and even update your Nginx config for you.

1.  Run the Certbot command for Nginx:
    ```bash
    sudo certbot --nginx
    ```

2.  Certbot will guide you through a series of interactive prompts:
    *   **Enter your email address:** This is important for renewal reminders and urgent notices.
    *   **Agree to the Terms of Service:** Read and agree by typing `Y`.
    *   **Share your email with the EFF (optional):** Choose `Y` or `N`.
    *   **Which names would you like to activate HTTPS for?:** It will show a list of the domains it found in your Nginx config (e.g., `yourdomain.com` and `www.yourdomain.com`). You can usually just press `Enter` to select all of them.

3.  **The Most Important Step - Redirecting HTTP to HTTPS:**
    Certbot will ask if you want to redirect all HTTP traffic to HTTPS.
    ```
    Please choose whether or not to redirect HTTP traffic to HTTPS, removing HTTP access.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    1: No redirect - Make no further changes to the webserver configuration.
    2: Redirect - Make all requests redirect to secure HTTPS access. Choose this for
    new sites, or if you're confident your site works on HTTPS. You can undo this
    change by editing your web server's configuration.
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    Select the appropriate number [1-2] then [enter] (press 'c' to cancel):
    ```
    **You should almost always choose option `2`.** This is a critical security best practice. Type `2` and press `Enter`.

4.  If everything is successful, you will see a confirmation message telling you that your certificate has been deployed and where it's saved.

### **Step 4: Verify Automatic Renewal**

Let's Encrypt certificates are only valid for 90 days. However, Certbot automatically creates a systemd timer or cron job that will renew your certificates before they expire.

You can test that the renewal process is working with a "dry run":
```bash
sudo certbot renew --dry-run
```
If you see a "Congratulations" message and no errors, your auto-renewal is set up correctly.

### **Step 5: Verify in Your Browser**

1.  Open your web browser and navigate to your domain:
    `https://yourdomain.com`

2.  You should see the **padlock icon** in the address bar, indicating a secure connection.

3.  Also, try navigating to the non-secure version: `http://yourdomain.com`. You should be automatically redirected to the `https` version.

Congratulations! Your Next.js application is now fully secured with a free, auto-renewing SSL certificate.