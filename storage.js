// storage.js
// Data Access Layer

const DEMO_DATA = {
    apps: [
        { id: 'app_1', title: 'Pro Video Editor X', description: 'Advanced mobile video editing with AI features, 4K export, and professional transition packs.', category: 'Editing', version: '2.5.0', size: 156000000, rating: 4.8, downloads: 125000, developer: 'TechNova Studio', releaseDate: '2026-05-12', icon: 'movie_edit', images: [], features: ['AI Background Removal', '4K Export', 'Multi-track timeline', 'Cloud Sync'], whatsNew: 'Added new AI voiceover generation and 50+ new transitions.', requirements: 'Android 10.0+', downloadUrl: '#' },
        { id: 'app_2', title: 'Nova Launcher Prime', description: 'The ultimate customizable home screen replacement for your device.', category: 'Personalization', version: '8.0.1', size: 12000000, rating: 4.9, downloads: 500000, developer: 'TeslaCoil', releaseDate: '2026-06-01', icon: 'space_dashboard', images: [], features: ['Custom Icons', 'Gestures', 'App Drawer Groups'], whatsNew: 'Material You dynamic color support.', requirements: 'Android 8.0+', downloadUrl: '#' },
        { id: 'app_3', title: 'CodeMaster IDE', description: 'Write, compile and run code directly on your mobile device. Supports Python, JS, C++.', category: 'Development', version: '1.2.4', size: 45000000, rating: 4.6, downloads: 85000, developer: 'DevTools Inc', releaseDate: '2026-06-15', icon: 'code', images: [], features: ['Syntax Highlighting', 'Offline Compiler', 'Git Integration'], whatsNew: 'Added support for Rust and Go.', requirements: 'Android 11.0+', downloadUrl: '#' }
    ],
    files: [
        { id: 'file_1', title: 'Premium Web UI Kit', description: 'A complete Figma UI kit with 500+ components.', size: 124000000, category: 'Templates', uploadDate: '2026-06-20', icon: 'design_services', type: 'ZIP', downloads: 3400, downloadUrl: '#' },
        { id: 'file_2', title: 'Midjourney Prompt Engineering Guide', description: 'Comprehensive PDF guide to writing perfect AI prompts.', size: 4500000, category: 'AI Prompts', uploadDate: '2026-06-25', icon: 'picture_as_pdf', type: 'PDF', downloads: 8900, downloadUrl: '#' }
    ],
    videos: [
        { id: 'vid_1', title: 'How to Build a Glassmorphism UI', description: 'Learn the secrets of modern web design with this comprehensive tutorial.', thumbnail: 'play_circle', url: 'https://youtube.com', promptUsed: 'Generate a stunning glassmorphism dashboard UI...', resources: ['CSS variables snippet', 'Figma file'], date: '2026-06-22' }
    ],
    categories: [
        { id: 'cat_1', name: 'Editing', order: 1 },
        { id: 'cat_2', name: 'Personalization', order: 2 },
        { id: 'cat_3', name: 'Development', order: 3 },
        { id: 'cat_4', name: 'Games', order: 4 },
        { id: 'cat_5', name: 'Productivity', order: 5 },
        { id: 'cat_6', name: 'Templates', order: 6 },
        { id: 'cat_7', name: 'AI Prompts', order: 7 }
    ],
    updates: [
        { id: 'upd_1', title: 'Platform Launch (v1.0)', date: '2026-06-28', content: 'Initial release of HI-TECH CHRONICLES platform.\n- Premium app marketplace.\n- Download center.\n- Fully offline PWA.' }
    ],
    settings: {
        siteName: 'HI-TECH CHRONICLES',
        heroTitle: 'HI-TECH CHRONICLES',
        heroSubtitle: 'The ultimate premium hub for downloading the best apps, UI kits, templates, and tech resources. Pure performance, pure design.',
        contactEmail: 'hello@hitech.com',
        youtubeUrl: 'https://youtube.com',
        githubUrl: 'https://github.com',
        footerText: '© 2026 HI-TECH CHRONICLES. All rights reserved.'
    },
    stats: { totalVisitors: 1542000, appsDownloaded: 4500000, activeResources: 850 }
};

const StorageManager = {
    init: async () => {
        if (!localStorage.getItem('htc_initialized')) {
            localStorage.setItem('htc_apps', JSON.stringify(DEMO_DATA.apps));
            localStorage.setItem('htc_files', JSON.stringify(DEMO_DATA.files));
            localStorage.setItem('htc_videos', JSON.stringify(DEMO_DATA.videos));
            localStorage.setItem('htc_categories', JSON.stringify(DEMO_DATA.categories));
            localStorage.setItem('htc_updates', JSON.stringify(DEMO_DATA.updates));
            localStorage.setItem('htc_settings', JSON.stringify(DEMO_DATA.settings));
            localStorage.setItem('htc_stats', JSON.stringify(DEMO_DATA.stats));
            localStorage.setItem('htc_initialized', 'true');
            localStorage.setItem('htc_history', JSON.stringify([]));
            localStorage.setItem('htc_bookmarks', JSON.stringify([]));
        }
    },
    
    get: async (key) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const db = FirebaseManager.getDb();
                const colRef = FirebaseManager.api.collection(db, key);
                const snapshot = await FirebaseManager.api.getDocs(colRef);
                let data = [];
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                if (key === 'categories') {
                    data.sort((a, b) => a.order - b.order);
                }
                if (key === 'updates') {
                    data.sort((a, b) => new Date(b.date) - new Date(a.date));
                }
                return data;
            } catch(e) {
                console.error("Firestore get error, falling back:", e);
                return JSON.parse(localStorage.getItem(`htc_${key}`)) || [];
            }
        } else {
            let data = [];
            try { data = JSON.parse(localStorage.getItem(`htc_${key}`)) || []; } catch (e) { }
            if (key === 'categories') data.sort((a, b) => a.order - b.order);
            if (key === 'updates') data.sort((a, b) => new Date(b.date) - new Date(a.date));
            return data;
        }
    },
    
    set: async (key, data) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const db = FirebaseManager.getDb();
            if (key === 'stats' || key === 'history' || key === 'bookmarks' || key === 'settings') {
                const docRef = FirebaseManager.api.doc(db, 'system', key);
                await FirebaseManager.api.setDoc(docRef, { data });
            }
        } else {
            localStorage.setItem(`htc_${key}`, JSON.stringify(data));
        }
    },

    addItem: async (col, data) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const db = FirebaseManager.getDb();
            const docRef = FirebaseManager.api.doc(db, col, data.id);
            await FirebaseManager.api.setDoc(docRef, data);
        } else {
            const items = await StorageManager.get(col);
            items.push(data);
            await StorageManager.set(col, items);
        }
    },
    
    updateItem: async (col, id, data) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const db = FirebaseManager.getDb();
            const docRef = FirebaseManager.api.doc(db, col, id);
            await FirebaseManager.api.updateDoc(docRef, data);
        } else {
            let items = await StorageManager.get(col);
            items = items.map(i => i.id === id ? { ...i, ...data } : i);
            await StorageManager.set(col, items);
        }
    },
    
    deleteItem: async (col, id) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const db = FirebaseManager.getDb();
            const docRef = FirebaseManager.api.doc(db, col, id);
            await FirebaseManager.api.deleteDoc(docRef);
        } else {
            let items = await StorageManager.get(col);
            items = items.filter(i => i.id !== id);
            await StorageManager.set(col, items);
        }
    },

    getAppById: async (id) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const db = FirebaseManager.getDb();
                const docRef = FirebaseManager.api.doc(db, 'apps', id);
                const docSnap = await FirebaseManager.api.getDoc(docRef);
                if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
            } catch (e) { console.error("Firestore fetch error:", e); }
        }
        const apps = await StorageManager.get('apps');
        return apps.find(a => a.id === id);
    },
    
    addHistory: async (itemType, itemTitle) => {
        const history = await StorageManager.get('history');
        history.unshift({ type: itemType, title: itemTitle, date: new Date().toISOString() });
        if(history.length > 50) history.pop();
        await StorageManager.set('history', history);
    },

    toggleBookmark: async (appId) => {
        let bookmarks = await StorageManager.get('bookmarks');
        if (bookmarks.includes(appId)) {
            bookmarks = bookmarks.filter(id => id !== appId);
            if(typeof Utils !== 'undefined') Utils.showToast('Removed from bookmarks');
        } else {
            bookmarks.push(appId);
            if(typeof Utils !== 'undefined') Utils.showToast('Added to bookmarks');
        }
        await StorageManager.set('bookmarks', bookmarks);
        return bookmarks.includes(appId);
    },
    
    isBookmarked: async (appId) => {
        const bookmarks = await StorageManager.get('bookmarks');
        return bookmarks.includes(appId);
    },
    
    getStats: async () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const db = FirebaseManager.getDb();
                const docRef = FirebaseManager.api.doc(db, 'system', 'stats');
                const docSnap = await FirebaseManager.api.getDoc(docRef);
                if (docSnap.exists()) return docSnap.data().data || docSnap.data();
            } catch(e) { console.error("Firestore fetch error:", e); }
        }
        return JSON.parse(localStorage.getItem('htc_stats')) || DEMO_DATA.stats;
    },

    getSettings: async () => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const db = FirebaseManager.getDb();
                const docRef = FirebaseManager.api.doc(db, 'system', 'settings');
                const docSnap = await FirebaseManager.api.getDoc(docRef);
                if (docSnap.exists()) return docSnap.data().data || docSnap.data();
            } catch(e) {}
        }
        return JSON.parse(localStorage.getItem('htc_settings')) || DEMO_DATA.settings;
    },
    
    updateSettings: async (settingsData) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const db = FirebaseManager.getDb();
            const docRef = FirebaseManager.api.doc(db, 'system', 'settings');
            await FirebaseManager.api.setDoc(docRef, { data: settingsData }, { merge: true });
        } else {
            localStorage.setItem('htc_settings', JSON.stringify(settingsData));
        }
    },

    incrementDownloadStat: async (type, itemId = null) => {
        let currentStats = await StorageManager.getStats();
        
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            try {
                const db = FirebaseManager.getDb();
                const docRef = FirebaseManager.api.doc(db, 'system', 'stats');
                
                if (type === 'app') currentStats.appsDownloaded = (currentStats.appsDownloaded || 0) + 1;
                
                await FirebaseManager.api.setDoc(docRef, { data: currentStats }, { merge: true });

                if (itemId) {
                    const col = type === 'app' ? 'apps' : (type === 'file' ? 'files' : 'videos');
                    const itemRef = FirebaseManager.api.doc(db, col, itemId);
                    const itemSnap = await FirebaseManager.api.getDoc(itemRef);
                    if(itemSnap.exists()) {
                        const itemData = itemSnap.data();
                        itemData.downloads = (itemData.downloads || 0) + 1;
                        await FirebaseManager.api.updateDoc(itemRef, { downloads: itemData.downloads });
                    }
                }
            } catch(e) { console.error(e); }
        } else {
            if (type === 'app') currentStats.appsDownloaded = (currentStats.appsDownloaded || 0) + 1;
            await StorageManager.set('stats', currentStats);

            if (itemId) {
                const col = type === 'app' ? 'apps' : (type === 'file' ? 'files' : 'videos');
                let items = await StorageManager.get(col);
                items = items.map(i => {
                    if(i.id === itemId) i.downloads = (i.downloads || 0) + 1;
                    return i;
                });
                await StorageManager.set(col, items);
            }
        }
    },

    uploadAsset: async (file, path) => {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.isActive()) {
            const storage = FirebaseManager.getStorage();
            const storageRef = FirebaseManager.api.ref(storage, path);
            await FirebaseManager.api.uploadBytes(storageRef, file);
            return await FirebaseManager.api.getDownloadURL(storageRef);
        } else {
            return new Promise((resolve) => {
                setTimeout(() => resolve(URL.createObjectURL(file)), 500);
            });
        }
    },
    
    // Kept for backward compatibility
    addApp: async (data) => await StorageManager.addItem('apps', data),
    updateApp: async (id, data) => await StorageManager.updateItem('apps', id, data),
    deleteApp: async (id) => await StorageManager.deleteItem('apps', id)
};
