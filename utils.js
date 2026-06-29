const Utils = {
    showToast: (message, duration = 3000) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="material-symbols-rounded">info</span><span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    formatBytes: (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },

    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    animateCounter: (element, target, duration = 2000) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * target);
            element.innerText = current.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = target.toLocaleString() + (element.dataset.suffix || '');
            }
        };
        window.requestAnimationFrame(step);
    },

    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showToast("Copied to clipboard!");
        } catch (err) {
            Utils.showToast("Failed to copy");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // FAB logic
    const fab = document.getElementById('fab-top');
    if (fab) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                fab.classList.remove('hidden');
            } else {
                fab.classList.add('hidden');
            }
        });
        fab.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Theme logic
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (localStorage.getItem('theme') === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if(themeBtn) themeBtn.querySelector('span').innerText = 'dark_mode';
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                themeBtn.querySelector('span').innerText = 'light_mode';
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                themeBtn.querySelector('span').innerText = 'dark_mode';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
        closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
        
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.remove('active'));
        });
    }
});

window.downloadItem = async (type, itemId, url) => {
    if(typeof StorageManager !== 'undefined') {
        await StorageManager.addHistory(type, itemId);
        await StorageManager.incrementDownloadStat(type, itemId);
    }
    Utils.showToast(`Starting download...`);
    
    if (url && url !== '#') {
        window.open(url, '_blank');
    }
};
