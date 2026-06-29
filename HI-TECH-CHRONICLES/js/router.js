// router.js
// Handles SPA navigation and initialisation

const Router = {
    init: async () => {
        // Initialize Core Systems
        if(typeof FirebaseManager !== 'undefined') FirebaseManager.init();
        if(typeof AuthManager !== 'undefined') AuthManager.init();
        await StorageManager.init();
        if(typeof PWAManager !== 'undefined') PWAManager.init();
        SearchManager.init();
        
        // Apply Global Settings
        const settings = await StorageManager.getSettings();
        document.title = settings.siteName;
        const footer = document.querySelector('footer p');
        if(footer) footer.innerText = settings.footerText;
        const brand = document.querySelector('.nav-brand');
        if(brand) brand.innerHTML = `<span class="material-symbols-rounded">rocket_launch</span> ${settings.siteName}`;
        
        window.addEventListener('hashchange', Router.handleRoute);
        
        // Initial load
        if(!window.location.hash) {
            window.location.hash = '#home';
        } else {
            Router.handleRoute();
        }
    },

    handleRoute: async () => {
        const hash = window.location.hash || '#home';
        const contentDiv = document.getElementById('app-content');
        
        // Update nav active state
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if(hash.startsWith(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
        
        // Skeleton loading effect
        contentDiv.innerHTML = '<div class="container section"><div class="skeleton" style="height:300px; width:100%; margin-bottom:20px;"></div><div class="grid-3"><div class="skeleton" style="height:200px"></div><div class="skeleton" style="height:200px"></div><div class="skeleton" style="height:200px"></div></div></div>';
        window.scrollTo(0,0);
        
        // Render View
        try {
            if (hash === '#home') {
                await Router.renderHome(contentDiv);
            } else if (hash === '#apps') {
                await AppsManager.renderApps(contentDiv);
            } else if (hash.startsWith('#app/')) {
                const id = hash.split('/')[1];
                await AppsManager.renderAppDetail(contentDiv, id);
            } else if (hash === '#downloads') {
                const html = await DownloadsManager.renderDownloads();
                contentDiv.innerHTML = html;
            } else if (hash === '#youtube') {
                const html = await DownloadsManager.renderYouTube();
                contentDiv.innerHTML = html;
            } else if (hash === '#updates') {
                const html = await Router.renderUpdates();
                contentDiv.innerHTML = html;
            } else if (hash === '#about') {
                Router.renderAbout(contentDiv);
            } else if (hash === '#contact') {
                Router.renderContact(contentDiv);
            } else if (hash === '#admin') {
                contentDiv.innerHTML = AdminManager.renderAdminLogin();
            } else if (hash === '#admin-dashboard') {
                const dashboardHTML = await AdminManager.renderDashboard();
                contentDiv.innerHTML = dashboardHTML;
            } else {
                await Router.renderHome(contentDiv);
            }
        } catch (error) {
            console.error("Routing error:", error);
            contentDiv.innerHTML = '<div class="section container" style="text-align:center;"><h2>Error loading page.</h2></div>';
        }
    },

    renderHome: async (container) => {
        const apps = await StorageManager.get('apps');
        const settings = await StorageManager.getSettings();
        const topApps = apps.slice(0, 6);
        const appsHTML = topApps.map(app => UI.renderAppCard(app)).join('');

        container.innerHTML = `
            <div class="hero section">
                <div class="container" style="text-align: center;">
                    <h1 class="hero-title">${settings.heroTitle}</h1>
                    <p class="hero-subtitle">${settings.heroSubtitle}</p>
                    <div style="margin-top: 30px; display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                        <a href="#apps" class="btn btn-primary" style="padding: 15px 30px; font-size: 1.1rem;">Explore Apps</a>
                        <a href="#downloads" class="btn btn-secondary" style="padding: 15px 30px; font-size: 1.1rem;">Resources</a>
                    </div>
                </div>
            </div>

            <div class="section container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 class="section-title" style="margin: 0;">Featured Apps</h2>
                    <a href="#apps" style="color: var(--accent-primary); text-decoration: none; font-weight: 600;">View All <span class="material-symbols-rounded" style="vertical-align: middle; font-size: 20px;">arrow_forward</span></a>
                </div>
                <div class="grid-3" id="featured-apps">
                    ${appsHTML}
                </div>
            </div>
            
            <div class="section container" style="background: var(--bg-secondary); border-radius: 20px; padding: 40px; text-align: center; margin-top: 40px;">
                <h2 style="font-size: 2rem; margin-bottom: 15px;">Stay Updated</h2>
                <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 30px;">Join our community to get the latest news on premium app releases and design resources.</p>
                <div style="display: flex; max-width: 400px; margin: 0 auto; gap: 10px;">
                    <input type="email" placeholder="Enter your email" style="flex: 1;">
                    <button class="btn btn-primary">Subscribe</button>
                </div>
            </div>
        `;
    },

    renderUpdates: async () => {
        const updates = await StorageManager.get('updates');
        let updatesHTML = updates.map(update => `
            <div class="card" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <h3 style="font-size: 1.5rem; color: var(--accent-primary);">${update.title}</h3>
                    <span class="badge" style="background: var(--bg-secondary); color: var(--text-secondary);">${Utils.formatDate(update.date)}</span>
                </div>
                <p style="color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">${update.content}</p>
            </div>
        `).join('');
        
        if(updates.length === 0) updatesHTML = '<p style="color:var(--text-secondary)">No updates available yet.</p>';

        return `
            <div class="section container page-view" style="max-width: 800px; margin: 0 auto;">
                <h2 class="section-title" style="text-align: center; margin-bottom: 40px;">News & Updates</h2>
                <div id="updates-list">
                    ${updatesHTML}
                </div>
            </div>
        `;
    },

    renderAbout: (container) => {
        container.innerHTML = `
            <div class="page-view section container" style="max-width:800px; text-align:center;">
                <div style="width:150px; height:150px; border-radius:50%; background:var(--gradient-primary); margin:0 auto 30px; display:flex; align-items:center; justify-content:center; color:white; font-size:4rem; box-shadow:0 10px 30px rgba(139,92,246,0.3);">
                    <span class="material-symbols-rounded" style="font-size:5rem;">person</span>
                </div>
                <h1 class="section-title text-gradient">About The Developer</h1>
                <p style="color:var(--text-secondary); font-size:1.2rem; margin-bottom:40px; line-height:1.8;">
                    Welcome to HI-TECH CHRONICLES. I build premium digital experiences, tools, and resources for creators and developers worldwide.
                </p>
                <div class="grid-3" style="text-align:left; margin-bottom:40px;">
                    <div class="card">
                        <span class="material-symbols-rounded" style="font-size:2rem; color:var(--accent-primary); margin-bottom:10px;">code</span>
                        <h3>Clean Code</h3>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:10px;">No bulky frameworks. Built entirely with pure HTML, CSS, and vanilla JavaScript.</p>
                    </div>
                    <div class="card">
                        <span class="material-symbols-rounded" style="font-size:2rem; color:var(--accent-secondary); margin-bottom:10px;">design_services</span>
                        <h3>Premium Design</h3>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:10px;">Focusing on glassmorphism, fluid animations, and perfect typography.</p>
                    </div>
                    <div class="card">
                        <span class="material-symbols-rounded" style="font-size:2rem; color:gold; margin-bottom:10px;">speed</span>
                        <h3>Blazing Fast</h3>
                        <p style="color:var(--text-secondary); font-size:0.9rem; margin-top:10px;">Local storage rendering and zero network dependencies make this app instant.</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderContact: (container) => {
        container.innerHTML = `
            <div class="page-view section container" style="max-width:800px;">
                <h1 class="section-title text-gradient" style="text-align:center;">Get in Touch</h1>
                <p style="color:var(--text-secondary); margin-bottom:40px; font-size:1.1rem; text-align:center;">Have a question or want to collaborate? Drop a message below.</p>
                
                <div class="card glass-effect" style="padding:40px;">
                    <form onsubmit="event.preventDefault(); Utils.showToast('Message sent successfully!'); this.reset();" style="display:flex; flex-direction:column; gap:20px;">
                        <div style="display:flex; gap:20px; flex-wrap:wrap;">
                            <input type="text" placeholder="Your Name" required style="flex:1; min-width:200px;">
                            <input type="email" placeholder="Your Email" required style="flex:1; min-width:200px;">
                        </div>
                        <input type="text" placeholder="Subject" required>
                        <textarea rows="6" placeholder="Your Message" required></textarea>
                        <button type="submit" class="btn btn-primary" style="align-self:flex-start; padding:15px 40px; font-size:1.1rem;">
                            Send Message <span class="material-symbols-rounded">send</span>
                        </button>
                    </form>
                </div>
                
                <div style="display:flex; justify-content:center; gap:20px; margin-top:40px; flex-wrap:wrap;">
                    <a href="#" class="btn btn-secondary" onclick="Utils.copyToClipboard('hello@hitech.com')"><span class="material-symbols-rounded">mail</span> Email</a>
                    <a href="#" class="btn btn-secondary" onclick="window.open('https://youtube.com', '_blank')"><span class="material-symbols-rounded">smart_display</span> YouTube</a>
                    <a href="#" class="btn btn-secondary" onclick="window.open('https://github.com', '_blank')"><span class="material-symbols-rounded">code</span> GitHub</a>
                </div>
            </div>
        `;
    }
};

// Start the app when DOM is fully parsed
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
