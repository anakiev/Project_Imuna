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
import { db } from "@/lib/auth/clientApp";
import { getAuthenticatedAppForUser } from '@/lib/auth/serverApp';

export async function getMyProjects(db = db, filters = {}) {
    const { currentUser } = await getAuthenticatedAppForUser();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", currentUser?.email));
	// q = applyQueryFilters(q, filters);
	const results = await getDocs(q);
	return results.docs.map(doc => {

		return {
			id: doc.id,
			...doc.data(),
			// Only plain objects can be passed to Client Components from Server Components
		};
	});
}




function applyQueryFilters(q, { category, city, price, sort }) {
	if (category) {
		q = query(q, where("category", "==", category));
	}
	if (city) {
		q = query(q, where("city", "==", city));
	}
	if (price) {
		q = query(q, where("price", "==", price.length));
	}
	if (sort === "Rating" || !sort) {
		q = query(q, orderBy("avgRating", "desc"));
	} else if (sort === "Review") {
		q = query(q, orderBy("numRatings", "desc"));
	}
	return q;
}