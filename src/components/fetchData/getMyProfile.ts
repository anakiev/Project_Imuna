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
} from "firebase/firestore";
import { db, auth } from "@/lib/auth/clientApp";







export async function getMyProfile(db = db, filters = {}) {
    const  currentUser  = auth.currentUser;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", currentUser?.email));
	// q = applyQueryFilters(q, filters);
	const results = await getDocs(q);
	return results.docs.map(doc => {

		return {
			//id: doc.id,
			...doc.data(),
			// Only plain objects can be passed to Client Components from Server Components
		};
	});
}