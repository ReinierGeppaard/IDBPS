import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDQwmB8as_dzwnCeT3xf8qnUaAb3wrT4Kc",
    authDomain: "idbps-96864.firebaseapp.com",
    projectId: "idbps-96864",
    storageBucket: "idbps-96864.appspot.com",
    messagingSenderId: "654919256641",
    appId: "1:654919256641:web:74248fe8c2a920aa2314c0",
    measurementId: "G-5PXR9PHVWT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // Export the authentication module
export const storage = getStorage(app); // Export the storage module

export { app as firebase }; // Export the Firebase instance
