document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signin-form');
    const showSignupLink = document.getElementById('show-signup');
    
    // Handle sign in
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const submitBtn = signinForm.querySelector('.sign-in-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            
            // Simulate authentication (replace with real API call)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Store user session
            localStorage.setItem('user', JSON.stringify({
                id: 1,
                name: email.split('@')[0],
                email: email
            }));
            
            showNotification('Welcome to Aivio! 🎬', 'success');
            
            // Redirect to main site after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Sign in error:', error);
            showNotification('Sign in failed. Please try again.', 'error');
            signinForm.querySelector('.sign-in-btn').textContent = 'Sign In';
            signinForm.querySelector('.sign-in-btn').disabled = false;
        }
    });
    
    // Handle sign up link
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupForm();
    });
    
    function showSignupForm() {
        const signupHTML = `
            <div class="signup-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div class="signup-content" style="background: white; padding: 40px; border-radius: 20px; max-width: 400px; width: 90%;">
                    <h2 style="color: #2575fc; margin-bottom: 10px; text-align: center;">Create Account</h2>
                    <p style="color: #666; margin-bottom: 20px; text-align: center;">Join the Aivio community</p>
                    
                    <form id="signup-form" style="margin-bottom: 20px;">
                        <div class="form-group">
                            <input type="text" id="signup-username" placeholder="Username" required style="width: 100%; padding: 15px; border: 2px solid #e1e1e1; border-radius: 10px; font-size: 1rem; margin-bottom: 15px;">
                        </div>
                        <div class="form-group">
                            <input type="email" id="signup-email" placeholder="Email" required style="width: 100%; padding: 15px; border: 2px solid #e1e1e1; border-radius: 10px; font-size: 1rem; margin-bottom: 15px;">
                        </div>
                        <div class="form-group">
                            <input type="password" id="signup-password" placeholder="Password" required style="width: 100%; padding: 15px; border: 2px solid #e1e1e1; border-radius: 10px; font-size: 1rem; margin-bottom: 20px;">
                        </div>
                        <button type="submit" class="sign-up-btn" style="width: 100%; padding: 15px; background: linear-gradient(to right, #6a11cb, #2575fc); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">Create Account</button>
                    </form>
                    
                    <button class="back-to-login" style="width: 100%; padding: 12px; background: transparent; border: 1px solid #2575fc; color: #2575fc; border-radius: 10px; font-size: 1rem; cursor: pointer;">Back to Login</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', signupHTML);
        
        document.getElementById('signup-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signup-username').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            if (username && email && password) {
                const submitBtn = this.querySelector('.sign-up-btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating account...';
                submitBtn.disabled = true;
                
                // Simulate account creation
                setTimeout(() => {
                    // Store user session
                    localStorage.setItem('user', JSON.stringify({
                        id: Date.now(),
                        name: username,
                        email: email
                    }));
                    
                    showNotification('Account created successfully! Welcome to Aivio! 🎬', 'success');
                    document.querySelector('.signup-overlay').remove();
                    
                    // Redirect to main site
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }, 1500);
            } else {
                showNotification('Please fill in all fields', 'error');
            }
        });
        
        document.querySelector('.back-to-login').addEventListener('click', function() {
            document.querySelector('.signup-overlay').remove();
        });
    }
    
    function showNotification(message, type) {
        // Remove existing notification
        const existingNotification = document.querySelector('.signin-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `signin-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
});