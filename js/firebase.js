import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, addDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

let app, db, auth, storage;
let isActive = false;

window.FirebaseManager = {
    init: () => {
        try {
            const config = window.firebaseConfig;

            if (config && config.apiKey && config.apiKey !== "YOUR_API_KEY") {
                app = initializeApp(config);
                db = getFirestore(app);
                auth = getAuth(app);
                storage = getStorage(app);

                isActive = true;
                console.log("Firebase Modular SDK initialized successfully.");
            } else {
                console.warn("Firebase config is placeholder. Running in local fallback mode.");
                isActive = false;
            }
        } catch (error) {
            console.error("Firebase initialization error:", error);
            isActive = false;
        }
    },

    isActive: () => isActive,
    getDb: () => db,
    getAuth: () => auth,
    getStorage: () => storage,

    api: {
        signInWithEmailAndPassword,
        signOut,
        onAuthStateChanged,

        collection,
        getDocs,
        getDoc,
        doc,
        setDoc,
        addDoc,
        deleteDoc,
        updateDoc,

        ref,
        uploadBytes,
        getDownloadURL
    }
};