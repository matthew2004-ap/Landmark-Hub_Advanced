import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// TODO: Replace with your Firebase project configuration
// You can get these values from the Firebase Console (Project Settings > General)
const firebaseConfig = {
   apiKey: "YOUR_API_KEY",
   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
   projectId: "YOUR_PROJECT_ID",
   storageBucket: "YOUR_PROJECT_ID.appspot.com",
   messagingSenderId: "YOUR_SENDER_ID",
   appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

// Check if Firebase is properly configured
export const isConfigured = () => {
   return firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Helper for real-time cloud sync
export const syncCloud = (collName, docId, onUpdate) => {
   return onSnapshot(doc(firestore, collName, docId), (doc) => {
      if (doc.exists()) {
         onUpdate(doc.data().value);
      }
   });
};

// Helper for cloud persistence
export const setCloud = async (collName, docId, value) => {
   try {
      await setDoc(doc(firestore, collName, docId), { value });
      return true;
   } catch (err) {
      console.error("Cloud save failed:", err);
      return false;
   }
};

// Helper for initial data fetch
export const getCloud = async (collName, docId) => {
   try {
      const snap = await getDoc(doc(firestore, collName, docId));
      return snap.exists() ? snap.data().value : null;
   } catch (err) {
      console.error("Cloud fetch failed:", err);
      return null;
   }
};
