## **Title: Automate Next.js Deployment to EC2 with GitLab CI/CD**

We'll create a `.gitlab-ci.yml` file that instructs GitLab Runners to securely connect to your EC2 instance and deploy your application every time you push to the `main` branch.

### **Step 1: The Security Bridge - Setting up GitLab CI/CD Variables**

This is the equivalent of GitHub Secrets. We need to securely provide GitLab with the credentials to access your EC2 instance.

1.  Go to your project's repository on GitLab.
2.  In the left sidebar, navigate to **Settings -> CI/CD**.
3.  Find the **"Variables"** section and click **"Expand"**.
4.  Click the **"Add variable"** button for each of the three variables below.

    *   **Variable 1: Host IP**
        *   Key: `EC2_HOST`
        *   Value: Your EC2 instance's public IP address (e.g., `12.123.456.89`).
        *   Type: `Variable`
        *   Flags: Keep "Protect variable" checked.

    *   **Variable 2: Username**
        *   Key: `EC2_USERNAME`
        *   Value: `ubuntu`
        *   Type: `Variable`
        *   Flags: Keep "Protect variable" checked.

    *   **Variable 3: The SSH Private Key (CRITICAL STEP)**
        *   Key: `EC2_SSH_KEY`
        *   **Type: `File`** (This is very important! It handles the multi-line key correctly.)
        *   Value:
            *   Open your `.pem` file (e.g., `ai-chatbot-metrics-dashboard.pem`) in a text editor.
            *   Copy the **entire content**, including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`.
            *   Paste the entire content into the "Value" box.
        *   Flags: Keep "Protect variable" checked.

When you're done, your variables section should look like this:


### **Step 2: Creating the `.gitlab-ci.yml` File**

In GitLab, all CI/CD configuration lives in a single file named `.gitlab-ci.yml` at the **root of your repository**.

1.  Create a file named `.gitlab-ci.yml` in the root directory of your local project.
2.  Copy and paste the following code into the file. Read the comments carefully.

```yaml
# Define the stages of our pipeline. We only need one: 'deploy'.
stages:
  - deploy

# This is our main deployment job.
deploy_to_ec2:
  # Assign this job to the 'deploy' stage.
  stage: deploy

  # Use a standard Ubuntu image for our job environment.
  # The GitLab Runner will pull this Docker image to run the commands.
  image: ubuntu:latest

  # Commands to run before the main script.
  # We use this to set up our SSH environment.
  before_script:
    - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )'
    - 'eval $(ssh-agent -s)'
    # The EC2_SSH_KEY is a File-type variable, so GitLab creates a file with its path in $EC2_SSH_KEY.
    # We set the correct permissions for the SSH key file.
    - 'chmod 600 "$EC2_SSH_KEY"'

  # The main script for deployment.
  script:
    - |
      echo "Deploying to EC2 server..."
      # Execute the deployment commands on the remote EC2 server via SSH.
      # -o StrictHostKeyChecking=no: Automatically accepts the host's key fingerprint.
      # Note the double quotes around the multi-line script.
      ssh -i "$EC2_SSH_KEY" -o StrictHostKeyChecking=no ${EC2_USERNAME}@${EC2_HOST} "
        # ====================================================================
        # SCRIPT RUNNING ON THE EC2 SERVER
        # ====================================================================
        
        # Load NVM environment for the non-interactive shell.
        # Note the escaped dollar signs (\$) to prevent GitLab from expanding them locally.
        export NVM_DIR=\"\$HOME/.nvm\"
        [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
        
        # Navigate to the project directory.
        # IMPORTANT: Replace 'dashboard' with your project folder name on the server.
        cd ~/dashboard
        
        echo 'Pulling latest code from main branch...'
        git pull origin main
        
        echo 'Installing dependencies...'
        npm install
        
        echo 'Building the application...'
        npm run build
        
        echo 'Reloading the app with PM2...'
        # IMPORTANT: Replace 'my-next-app' with your PM2 process name.
        pm2 reload my-next-app
        
        echo 'Deployment finished successfully!'
      "

  # Define rules for when this job should run.
  rules:
    # Only run this job on pushes to the 'main' branch.
    - if: '$CI_COMMIT_BRANCH == "main"'

```

**Before you save, make sure you update these two placeholders in the `script` section:**
*   `cd ~/dashboard`: Change `dashboard` to the name of your project directory on the EC2 server.
*   `pm2 reload my-next-app`: Change `my-next-app` to the name of your PM2 process.

### **Step 3: Commit and Push to GitLab**

Commit your new `.gitlab-ci.yml` file and push it to your GitLab repository.

```bash
git add .gitlab-ci.yml
git commit -m "feat: Add GitLab CI/CD deployment pipeline"
git push origin main
```

### **Step 4: Watch the Pipeline Run**

This push will automatically trigger the pipeline.
1.  Go back to your project on GitLab.
2.  In the left sidebar, click on **CI/CD -> Pipelines**.
3.  You will see your pipeline running. You can click on the job `deploy_to_ec2` to see the live logs and watch your deployment happen in real-time.

From now on, every push to the `main` branch will automatically deploy your application.