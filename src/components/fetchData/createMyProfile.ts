// import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";
/// @ts-nocheck
import {
	collection,
	onSnapshot,
	query,
	getDocs,
	doc,
	getDoc,
	updateDoc,
	orderBy,
	Timestamp,
	runTransaction,
	where,
	addDoc,
	getFirestore,
    setDoc
} from "firebase/firestore";
import { db, auth } from "@/lib/auth/clientApp";







export async function createMyProfile(db = db, filters = {}) {
    const  currentUser  = auth.currentUser;
    const newProfile = {
        email: currentUser.email,
        projects: [],
    };
    const usersCollectionRef = collection(db, 'users'); 
    const newProfileRef = doc(usersCollectionRef, currentUser?.uid); // Create a new document reference
    const result = await setDoc(newProfileRef, newProfile);

    // const res = await db.collection("users").doc(currentUser?.uid).set(newProfile, { merge: true });
   
    return newProfile;
}