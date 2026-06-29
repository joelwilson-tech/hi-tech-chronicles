// admin.js
// Complete Admin Dashboard Logic for all CMS features

const AdminManager = {
    renderAdminLogin: () => {
        return `
            <div class="section container page-view" style="max-width:500px; margin: 0 auto; text-align:center;">
                <h2 class="section-title">Admin Login</h2>
                <div class="card glass-effect" style="padding: 40px 20px;">
                    <span class="material-symbols-rounded" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;">admin_panel_settings</span>
                    <input type="email" id="admin-email" placeholder="Admin Email (leave blank for local demo)" style="margin-bottom: 15px; width:100%">
                    <input type="password" id="admin-pass" placeholder="Password (demo: admin)" style="margin-bottom: 20px; width:100%">
                    <button class="btn btn-primary" style="width: 100%; justify-content:center" onclick="AdminManager.handleLogin()">Login</button>
                </div>
            </div>
        `;
    },

    handleLogin: async () => {
        const email = document.getElementById('admin-email').value || 'demo@hitech.local';
        const pass = document.getElementById('admin-pass').value;
        const success = await AuthManager.login(email, pass);
        if (success) {
            Utils.showToast('Login successful');
            window.location.hash = '#admin-dashboard';
        } else {
            Utils.showToast('Invalid credentials');
        }
    },

    renderDashboard: async () => {
        if (!AuthManager.isAuthenticated()) {
            window.location.hash = '#admin';
            return '';
        }

        const stats = await StorageManager.getStats();
        const settings = await StorageManager.getSettings();
        
        // Fetch collections
        const apps = await StorageManager.get('apps');
        const files = await StorageManager.get('files');
        const videos = await StorageManager.get('videos');
        const categories = await StorageManager.get('categories');
        const updates = await StorageManager.get('updates');

        // Render Apps
        let appsListHTML = apps.map(app => `
            <div class="card" style="flex-direction:row; padding:15px; align-items:center; margin-bottom:10px;">
                <div class="card-icon" style="width:40px; height:40px; font-size:1.2rem; flex-shrink:0;">
                    ${app.customIconUrl ? `<img src="${app.customIconUrl}" alt="${app.title}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<span class="material-symbols-rounded">${app.icon}</span>`}
                </div>
                <div style="flex:1; margin-left:15px; overflow:hidden;">
                    <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${app.title} <span class="badge" style="font-size:0.7rem; margin-left:5px;">v${app.version}</span></div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${app.category} • Downloads: ${app.downloads || 0}</div>
                </div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="icon-btn" style="color:var(--accent-primary)" onclick="AdminManager.quickUpdateAPK('${app.id}')" aria-label="Quick Update APK" title="Quick Update APK"><span class="material-symbols-rounded">link</span></button>
                    <button class="icon-btn" onclick="AdminManager.showAppForm('${app.id}')" aria-label="Edit"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" style="color:var(--accent-secondary)" onclick="AdminManager.handleDelete('apps', '${app.id}')" aria-label="Delete"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');
        if(apps.length === 0) appsListHTML = '<p style="color:var(--text-secondary)">No apps found.</p>';

        // Render Files
        let filesListHTML = files.map(file => `
            <div class="card" style="flex-direction:row; padding:15px; align-items:center; margin-bottom:10px;">
                <div class="card-icon" style="width:40px; height:40px; font-size:1.2rem; flex-shrink:0;">
                    ${file.customIconUrl ? `<img src="${file.customIconUrl}" alt="${file.title}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<span class="material-symbols-rounded">${file.icon}</span>`}
                </div>
                <div style="flex:1; margin-left:15px; overflow:hidden;">
                    <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${file.category} • Downloads: ${file.downloads || 0}</div>
                </div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="icon-btn" onclick="AdminManager.showFileForm('${file.id}')"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" style="color:var(--accent-secondary)" onclick="AdminManager.handleDelete('files', '${file.id}')"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');
        if(files.length === 0) filesListHTML = '<p style="color:var(--text-secondary)">No files found.</p>';

        // Render Videos
        let videosListHTML = videos.map(vid => `
            <div class="card" style="flex-direction:row; padding:15px; align-items:center; margin-bottom:10px;">
                <div class="card-icon" style="width:40px; height:40px; font-size:1.2rem; flex-shrink:0;"><span class="material-symbols-rounded">play_circle</span></div>
                <div style="flex:1; margin-left:15px; overflow:hidden;">
                    <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${vid.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${Utils.formatDate(vid.date)}</div>
                </div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="icon-btn" onclick="AdminManager.showVideoForm('${vid.id}')"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" style="color:var(--accent-secondary)" onclick="AdminManager.handleDelete('videos', '${vid.id}')"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');
        if(videos.length === 0) videosListHTML = '<p style="color:var(--text-secondary)">No videos found.</p>';

        // Render Categories
        let categoriesListHTML = categories.map(cat => `
            <div class="card" style="flex-direction:row; padding:15px; align-items:center; margin-bottom:10px;">
                <div style="flex:1; font-weight:600;">${cat.name} <span class="badge" style="font-size:0.7rem; margin-left:10px;">Order: ${cat.order}</span></div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="icon-btn" onclick="AdminManager.showCategoryForm('${cat.id}')"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" style="color:var(--accent-secondary)" onclick="AdminManager.handleDelete('categories', '${cat.id}')"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');
        
        // Render Updates
        let updatesListHTML = updates.map(upd => `
            <div class="card" style="flex-direction:row; padding:15px; align-items:center; margin-bottom:10px;">
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${upd.title}</div>
                    <div style="font-size:0.8rem; color:var(--text-secondary)">${Utils.formatDate(upd.date)}</div>
                </div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="icon-btn" onclick="AdminManager.showUpdateForm('${upd.id}')"><span class="material-symbols-rounded">edit</span></button>
                    <button class="icon-btn" style="color:var(--accent-secondary)" onclick="AdminManager.handleDelete('updates', '${upd.id}')"><span class="material-symbols-rounded">delete</span></button>
                </div>
            </div>
        `).join('');

        return `
            <div class="section container page-view">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 40px; flex-wrap:wrap; gap:20px;">
                    <h2 class="section-title" style="margin:0;">Admin Dashboard</h2>
                    <button class="btn btn-secondary" onclick="AuthManager.logout()">Logout</button>
                </div>

                <!-- Stats Overview -->
                <div class="grid-3" style="margin-bottom: 40px;">
                    <div class="card" style="text-align:center; padding:30px;">
                        <span class="material-symbols-rounded" style="font-size:3rem; color:var(--accent-primary)">apps</span>
                        <h3>Total Apps</h3>
                        <p style="font-size:2rem; font-weight:bold; margin-top:10px;">${apps.length}</p>
                    </div>
                    <div class="card" style="text-align:center; padding:30px;">
                        <span class="material-symbols-rounded" style="font-size:3rem; color:var(--accent-secondary)">folder</span>
                        <h3>Total Files</h3>
                        <p style="font-size:2rem; font-weight:bold; margin-top:10px;">${files.length}</p>
                    </div>
                    <div class="card" style="text-align:center; padding:30px;">
                        <span class="material-symbols-rounded" style="font-size:3rem; color:gold">bar_chart</span>
                        <h3>Total App Downloads</h3>
                        <p style="font-size:2rem; font-weight:bold; margin-top:10px;">${stats.appsDownloaded || 0}</p>
                    </div>
                </div>

                <!-- CMS Sections (Stacked) -->
                
                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">Settings Configuration</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showSettingsForm()">
                            <span class="material-symbols-rounded">settings</span> Edit Settings
                        </button>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; color:var(--text-secondary);">
                        <div><strong>Site Name:</strong> ${settings.siteName}</div>
                        <div><strong>Contact Email:</strong> ${settings.contactEmail}</div>
                    </div>
                </div>

                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">App Manager</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showAppForm()">
                            <span class="material-symbols-rounded">add</span> Add New App
                        </button>
                    </div>
                    ${appsListHTML}
                </div>

                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">Resource Manager (Files)</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showFileForm()">
                            <span class="material-symbols-rounded">add</span> Add File
                        </button>
                    </div>
                    ${filesListHTML}
                </div>

                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">YouTube Resources</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showVideoForm()">
                            <span class="material-symbols-rounded">add</span> Add Video
                        </button>
                    </div>
                    ${videosListHTML}
                </div>

                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">Category Manager</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showCategoryForm()">
                            <span class="material-symbols-rounded">add</span> Add Category
                        </button>
                    </div>
                    ${categoriesListHTML}
                </div>
                
                <div class="card glass-effect" style="margin-bottom: 30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                        <h3 style="margin:0;">News & Updates</h3>
                        <button class="btn btn-primary" onclick="AdminManager.showUpdateForm()">
                            <span class="material-symbols-rounded">add</span> Add Update
                        </button>
                    </div>
                    ${updatesListHTML}
                </div>

                <div class="card glass-effect">
                    <h3 style="margin-bottom: 20px;">System Actions</h3>
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="AdminManager.resetData()">
                            <span class="material-symbols-rounded">restart_alt</span> Reset Demo Data
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    closeModal: () => {
        const modal = document.getElementById('admin-form-modal');
        if (modal) modal.remove();
    },

    getCategoryOptions: async (selected = '') => {
        const categories = await StorageManager.get('categories');
        return categories.map(c => `<option value="${c.name}" ${c.name === selected ? 'selected':''}>${c.name}</option>`).join('');
    },

    // ----------------------------------------------------
    // FORMS
    // ----------------------------------------------------

    showAppForm: async (id = null) => {
        AdminManager.closeModal();
        let app = id ? (await StorageManager.get('apps')).find(a => a.id === id) : null;
        const catOptions = await AdminManager.getCategoryOptions(app?.category);
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 600px; width:90%; padding:30px; max-height: 90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">${app ? 'Edit App' : 'Add New App'}</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveApp('${id || ''}')" style="display:flex; flex-direction:column; gap:15px;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Title</label>
                                <input type="text" id="frm-title" required value="${app?.title || ''}" style="width:100%">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Developer</label>
                                <input type="text" id="frm-developer" required value="${app?.developer || ''}" style="width:100%">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Category</label>
                                <select id="frm-category" required style="width:100%; padding:12px; border-radius:10px; background:var(--bg-secondary); border:1px solid var(--glass-border); color:var(--text-primary);">
                                    ${catOptions}
                                </select>
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Version</label>
                                <input type="text" id="frm-version" required value="${app?.version || '1.0.0'}" style="width:100%">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Material Icon</label>
                                <input type="text" id="frm-icon" required value="${app?.icon || 'android'}" style="width:100%">
                            </div>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Description</label>
                            <textarea id="frm-desc" required rows="3" style="width:100%">${app?.description || ''}</textarea>
                        </div>
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">What's New</label>
                            <textarea id="frm-whatsnew" required rows="2" style="width:100%">${app?.whatsNew || ''}</textarea>
                        </div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">GitHub Release / APK URL</label>
                                <input type="url" id="frm-download-url" required value="${app?.downloadUrl || ''}" placeholder="https://github.com/.../app.apk" style="width:100%">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Custom Icon (Optional)</label>
                                <input type="file" id="frm-asset" accept="image/*" style="width:100%; padding:10px; background:var(--bg-secondary); border-radius:10px; color:var(--text-primary)">
                            </div>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">${app ? 'Update App' : 'Publish App'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showFileForm: async (id = null) => {
        AdminManager.closeModal();
        let file = id ? (await StorageManager.get('files')).find(f => f.id === id) : null;
        const catOptions = await AdminManager.getCategoryOptions(file?.category);
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 600px; width:90%; padding:30px; max-height: 90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">${file ? 'Edit File' : 'Add File'}</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveFile('${id || ''}')" style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Title</label>
                            <input type="text" id="frm-title" required value="${file?.title || ''}" style="width:100%">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Category</label>
                                <select id="frm-category" required style="width:100%; padding:12px; border-radius:10px; background:var(--bg-secondary); border:1px solid var(--glass-border); color:var(--text-primary);">
                                    ${catOptions}
                                </select>
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Material Icon</label>
                                <input type="text" id="frm-icon" required value="${file?.icon || 'folder'}" style="width:100%">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Type (e.g. ZIP, PDF)</label>
                                <input type="text" id="frm-type" required value="${file?.type || 'ZIP'}" style="width:100%">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Approx Size (Bytes)</label>
                                <input type="number" id="frm-size" required value="${file?.size || 1000000}" style="width:100%">
                            </div>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Description</label>
                            <textarea id="frm-desc" required rows="3" style="width:100%">${file?.description || ''}</textarea>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">GitHub Release URL</label>
                                <input type="url" id="frm-download-url" required value="${file?.downloadUrl || ''}" placeholder="https://github.com/.../file.zip" style="width:100%">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Custom Icon (Optional)</label>
                                <input type="file" id="frm-asset" accept="image/*" style="width:100%; padding:10px; background:var(--bg-secondary); border-radius:10px; color:var(--text-primary)">
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">${file ? 'Update File' : 'Publish File'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showVideoForm: async (id = null) => {
        AdminManager.closeModal();
        let vid = id ? (await StorageManager.get('videos')).find(v => v.id === id) : null;
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 600px; width:90%; padding:30px; max-height: 90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">${vid ? 'Edit Video' : 'Add Video'}</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveVideo('${id || ''}')" style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Title</label>
                            <input type="text" id="frm-title" required value="${vid?.title || ''}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">YouTube URL</label>
                            <input type="url" id="frm-url" required value="${vid?.url || ''}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Description</label>
                            <textarea id="frm-desc" required rows="3" style="width:100%">${vid?.description || ''}</textarea>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">AI Prompt Used (Optional)</label>
                            <textarea id="frm-prompt" rows="2" style="width:100%">${vid?.promptUsed || ''}</textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showCategoryForm: async (id = null) => {
        AdminManager.closeModal();
        let cat = id ? (await StorageManager.get('categories')).find(c => c.id === id) : null;
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 400px; width:90%; padding:30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">${cat ? 'Edit Category' : 'Add Category'}</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveCategory('${id || ''}')" style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Category Name</label>
                            <input type="text" id="frm-name" required value="${cat?.name || ''}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Order (1-100)</label>
                            <input type="number" id="frm-order" required value="${cat?.order || 1}" style="width:100%">
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    showUpdateForm: async (id = null) => {
        AdminManager.closeModal();
        let upd = id ? (await StorageManager.get('updates')).find(u => u.id === id) : null;
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 600px; width:90%; padding:30px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">${upd ? 'Edit Update' : 'Add Update'}</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveUpdate('${id || ''}')" style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Title</label>
                            <input type="text" id="frm-title" required value="${upd?.title || ''}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Content (supports markdown/bullets)</label>
                            <textarea id="frm-content" required rows="6" style="width:100%">${upd?.content || ''}</textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    showSettingsForm: async () => {
        AdminManager.closeModal();
        const settings = await StorageManager.getSettings();
        
        const modalHTML = `
            <div class="modal-overlay active" id="admin-form-modal">
                <div class="modal-content glass-effect" style="max-width: 600px; width:90%; padding:30px; max-height: 90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h3 style="font-size:1.5rem; margin:0">Global Settings</h3>
                        <button class="icon-btn" onclick="AdminManager.closeModal()"><span class="material-symbols-rounded">close</span></button>
                    </div>
                    <form onsubmit="event.preventDefault(); AdminManager.handleSaveSettings()" style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Site Name</label>
                            <input type="text" id="stg-sitename" required value="${settings.siteName}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Hero Title</label>
                            <input type="text" id="stg-herotitle" required value="${settings.heroTitle}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Hero Subtitle</label>
                            <textarea id="stg-herosub" required rows="2" style="width:100%">${settings.heroSubtitle}</textarea>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Contact Email</label>
                            <input type="email" id="stg-email" required value="${settings.contactEmail}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">YouTube URL</label>
                            <input type="url" id="stg-youtube" required value="${settings.youtubeUrl}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">GitHub URL</label>
                            <input type="url" id="stg-github" required value="${settings.githubUrl}" style="width:100%">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; color:var(--text-secondary)">Footer Text</label>
                            <input type="text" id="stg-footer" required value="${settings.footerText}" style="width:100%">
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:20px;">
                            <button type="submit" class="btn btn-primary" id="save-btn">Save Settings</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ----------------------------------------------------
    // SAVE HANDLERS
    // ----------------------------------------------------

    _uploadHelper: async () => {
        const fileInput = document.getElementById('frm-asset');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            return await StorageManager.uploadAsset(file, `assets/uploads/${Date.now()}_${file.name}`);
        }
        return null;
    },

    _refresh: async () => {
        AdminManager.closeModal();
        const contentDiv = document.getElementById('app-content');
        contentDiv.innerHTML = await AdminManager.renderDashboard();
    },

    handleSaveApp: async (id) => {
        const btn = document.getElementById('save-btn');
        btn.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
        try {
            const downloadUrl = document.getElementById('frm-download-url').value;
            if (downloadUrl && !downloadUrl.includes('github.com')) {
                if(!confirm('The URL provided does not look like a GitHub Release URL. Do you want to save it anyway?')) {
                    btn.innerHTML = 'Save';
                    return;
                }
            }

            const assetUrl = await AdminManager._uploadHelper();
            const data = {
                id: id || `app_${Date.now()}`,
                title: document.getElementById('frm-title').value,
                developer: document.getElementById('frm-developer').value,
                category: document.getElementById('frm-category').value,
                version: document.getElementById('frm-version').value,
                icon: document.getElementById('frm-icon').value,
                description: document.getElementById('frm-desc').value,
                whatsNew: document.getElementById('frm-whatsnew').value,
                downloadUrl: downloadUrl,
                requirements: 'Android 8.0+',
                size: 15000000,
                rating: 5.0,
                downloads: 0,
                releaseDate: new Date().toISOString().split('T')[0],
                images: [],
                features: []
            };
            if (assetUrl) data.customIconUrl = assetUrl;

            if (id) {
                const existing = await StorageManager.getAppById(id);
                data.rating = existing.rating;
                data.downloads = existing.downloads;
                data.size = existing.size;
                data.features = existing.features;
                data.requirements = existing.requirements;
                if(!assetUrl && existing.customIconUrl) data.customIconUrl = existing.customIconUrl;
                await StorageManager.updateItem('apps', id, data);
                Utils.showToast('App updated!');
            } else {
                await StorageManager.addItem('apps', data);
                Utils.showToast('App created!');
            }
            await AdminManager._refresh();
        } catch (e) { Utils.showToast('Error saving.'); btn.innerHTML = 'Save'; }
    },

    quickUpdateAPK: async (id) => {
        const apps = await StorageManager.get('apps');
        const app = apps.find(a => a.id === id);
        if (!app) return;
        
        const newUrl = prompt(`Update GitHub Release APK URL for ${app.title}:`, app.downloadUrl || '');
        if (newUrl !== null) {
            const trimmedUrl = newUrl.trim();
            if (trimmedUrl !== '' && !trimmedUrl.includes('github.com')) {
                if(!confirm('This doesn\'t look like a GitHub URL. Continue anyway?')) return;
            }
            await StorageManager.updateItem('apps', id, { downloadUrl: trimmedUrl });
            Utils.showToast('APK URL updated successfully!');
            await AdminManager._refresh();
        }
    },

    handleSaveFile: async (id) => {
        const btn = document.getElementById('save-btn');
        btn.innerHTML = '<span class="material-symbols-rounded" style="animation: spin 1s linear infinite;">refresh</span>';
        try {
            const assetUrl = await AdminManager._uploadHelper();
            const data = {
                id: id || `file_${Date.now()}`,
                title: document.getElementById('frm-title').value,
                category: document.getElementById('frm-category').value,
                icon: document.getElementById('frm-icon').value,
                type: document.getElementById('frm-type').value,
                size: parseInt(document.getElementById('frm-size').value, 10),
                description: document.getElementById('frm-desc').value,
                downloadUrl: document.getElementById('frm-download-url').value,
                downloads: 0,
                uploadDate: new Date().toISOString().split('T')[0]
            };
            if (assetUrl) data.customIconUrl = assetUrl;

            if (id) {
                const existing = (await StorageManager.get('files')).find(f=>f.id===id);
                data.downloads = existing.downloads;
                if(!assetUrl && existing.customIconUrl) data.customIconUrl = existing.customIconUrl;
                await StorageManager.updateItem('files', id, data);
            } else {
                await StorageManager.addItem('files', data);
            }
            Utils.showToast('File saved!');
            await AdminManager._refresh();
        } catch (e) { Utils.showToast('Error saving.'); btn.innerHTML = 'Save'; }
    },

    handleSaveVideo: async (id) => {
        try {
            const data = {
                id: id || `vid_${Date.now()}`,
                title: document.getElementById('frm-title').value,
                url: document.getElementById('frm-url').value,
                description: document.getElementById('frm-desc').value,
                promptUsed: document.getElementById('frm-prompt').value,
                thumbnail: 'play_circle',
                date: new Date().toISOString().split('T')[0]
            };
            if (id) await StorageManager.updateItem('videos', id, data);
            else await StorageManager.addItem('videos', data);
            Utils.showToast('Video saved!');
            await AdminManager._refresh();
        } catch (e) { Utils.showToast('Error saving.'); }
    },

    handleSaveCategory: async (id) => {
        try {
            const data = {
                id: id || `cat_${Date.now()}`,
                name: document.getElementById('frm-name').value,
                order: parseInt(document.getElementById('frm-order').value, 10)
            };
            if (id) await StorageManager.updateItem('categories', id, data);
            else await StorageManager.addItem('categories', data);
            Utils.showToast('Category saved!');
            await AdminManager._refresh();
        } catch (e) { Utils.showToast('Error saving.'); }
    },

    handleSaveUpdate: async (id) => {
        try {
            const data = {
                id: id || `upd_${Date.now()}`,
                title: document.getElementById('frm-title').value,
                content: document.getElementById('frm-content').value,
                date: new Date().toISOString().split('T')[0]
            };
            if (id) await StorageManager.updateItem('updates', id, data);
            else await StorageManager.addItem('updates', data);
            Utils.showToast('Update saved!');
            await AdminManager._refresh();
        } catch (e) { Utils.showToast('Error saving.'); }
    },

    handleSaveSettings: async () => {
        try {
            const data = {
                siteName: document.getElementById('stg-sitename').value,
                heroTitle: document.getElementById('stg-herotitle').value,
                heroSubtitle: document.getElementById('stg-herosub').value,
                contactEmail: document.getElementById('stg-email').value,
                youtubeUrl: document.getElementById('stg-youtube').value,
                githubUrl: document.getElementById('stg-github').value,
                footerText: document.getElementById('stg-footer').value
            };
            await StorageManager.updateSettings(data);
            Utils.showToast('Settings saved! Reloading...');
            setTimeout(() => window.location.reload(), 1000); // Reload to apply global changes
        } catch (e) { Utils.showToast('Error saving.'); }
    },

    handleDelete: async (col, id) => {
        if(confirm(`Delete this item?`)) {
            try {
                await StorageManager.deleteItem(col, id);
                Utils.showToast('Item deleted!');
                await AdminManager._refresh();
            } catch(e) { Utils.showToast('Error deleting item.'); }
        }
    },

    resetData: () => {
        if(confirm('Are you sure you want to reset all data back to defaults?')) {
            localStorage.clear();
            StorageManager.init().then(() => {
                Utils.showToast('Data reset successfully');
                setTimeout(() => window.location.reload(), 1000);
            });
        }
    }
};
