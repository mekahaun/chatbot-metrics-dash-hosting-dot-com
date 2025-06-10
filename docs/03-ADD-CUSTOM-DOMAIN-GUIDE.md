## **Title: Guide to custom domain to the project**

### **Prerequisites**

*   **A purchased domain name:** You must have already bought a domain from a registrar like GoDaddy, Namecheap, Google Domains, etc.
*   **Access to your domain registrar's control panel:** You'll need to log in to manage your domain's DNS settings.
*   **Your EC2 instance's Public IPv4 address:** You can find this on your AWS EC2 dashboard.

---

### **Step 1: Pointing Your Domain to the EC2 Server (DNS Configuration)**

In this step, we will create `A` records in your domain's DNS settings. An `A` record (Address record) simply maps a name to an IP address.

1.  **Log in to Your Domain Registrar:** Go to the website where you bought your domain and log in to your account.

2.  **Find DNS Management:** Look for a section called "DNS Management," "Zone Editor," "Advanced DNS," or something similar.

3.  **Create Two `A` Records:** You will typically create two records: one for the root domain (e.g., `yourdomain.com`) and one for the `www` subdomain (e.g., `www.yourdomain.com`).

    *   **Important:** Your registrar might have existing default records (like a "parking page" record). It's best to delete any conflicting `A` records for `@` and `www` before adding new ones.

    **Record 1: For the root domain (`yourdomain.com`)**
    *   **Type:** `A`
    *   **Host** (or **Name**): `@` (The `@` symbol usually represents the root domain itself. Some registrars may want you to leave this field blank instead).
    *   **Value** (or **Points to**): `YOUR_EC2_PUBLIC_IP_ADDRESS`
    *   **TTL (Time To Live):** You can usually leave this at the default value (e.g., 1 hour or Automatic).

    **Record 2: For the `www` subdomain (`www.yourdomain.com`)**
    *   **Type:** `A`
    *   **Host** (or **Name**): `www`
    *   **Value** (or **Points to**): `YOUR_EC2_PUBLIC_IP_ADDRESS`
    *   **TTL (Time To Live):** Leave at default.

4.  **Save the changes.**

Here is an example of what the DNS settings might look like:

| Type | Host/Name | Value/Points to          | TTL     |
| :--- | :-------- | :----------------------- | :------ |
| A    | @         | 18.222.123.45            | 1 hour  |
| A    | www       | 18.222.123.45            | 1 hour  |

*(Replace `18.222.123.45` with your actual EC2 Public IP.)*

---

### **Step 2: Configuring Nginx to Recognize Your Domain**

Now that the world knows where to send requests for `yourdomain.com`, you need to tell your Nginx server to accept and handle them.

*(Note: If you already followed the SSL setup guide, you have already completed this step. This is just for confirmation.)*

1.  SSH into your EC2 instance.

2.  Open your Nginx configuration file:
    ```bash
    sudo nano /etc/nginx/sites-available/your-project-name
    ```

3.  Locate the `server_name` line. It should be changed from the IP address to your domain names.
    ```nginx
    server {
        # ... other settings

        # This is the important line
        server_name yourdomain.com www.yourdomain.com;

        location / {
            # ... proxy settings
        }
    }
    ```

4.  If you made any changes, save the file (`Ctrl+X`, `Y`, `Enter`).

5.  Test your Nginx configuration for errors:
    ```bash
    sudo nginx -t
    ```

6.  If the test is successful, restart Nginx to apply the changes:
    ```bash
    sudo systemctl restart nginx
    ```

---

### **Step 3: Waiting for DNS Propagation and Verification**

DNS changes are not instant. It can take anywhere from a few minutes to 48 hours for the changes to spread across the internet's DNS servers. This is called **DNS propagation**.

1.  **Check Propagation (Optional but Recommended):** You can use a free online tool like [whatsmydns.net](https://whatsmydns.net/) to check the status.
    *   Go to the site.
    *   Enter `yourdomain.com` in the search box.
    *   Select `A` from the dropdown menu.
    *   Click "Search."
    *   You should start seeing your EC2 server's IP address appear in locations around the world. Once a majority of them show the correct IP, you can proceed.

2.  **Test in Your Browser:** Once the DNS has propagated, open your web browser and navigate to `http://yourdomain.com`. Your Next.js application should load! Also, test `http://www.yourdomain.com`.

### **What's Next?**

Now that you have a custom domain pointing to your site, the next logical and **highly recommended** step is to **add an SSL certificate** to secure your site with HTTPS, as we discussed previously. This will give you the padlock icon and protect your users' data.