// @ts-nocheck
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/lib/auth/clientApp";

import { updateRestaurantImageReference } from "@/db/firestore";

export async function updateRestaurantImage(restaurantId, image) {
	try {
		if (!restaurantId)
			throw new Error("No restaurant ID has been provided.");

		if (!image || !image.name)
			throw new Error("A valid image has not been provided.");

		const publicImageUrl = await uploadImage(restaurantId, image);
		await updateRestaurantImageReference(restaurantId, publicImageUrl);

		return publicImageUrl;
	} catch (error) {
		console.error("Error processing request:", error);
	}
}

async function uploadImage(restaurantId, image) {
	const filePath = `images/${restaurantId}/${image.name}`;
	const newImageRef = ref(storage, filePath);
	await uploadBytesResumable(newImageRef, image);

	return await getDownloadURL(newImageRef);
}

async function uploadImage(userId, projectId, imageId, imageFile) {
  // Construct the full file path in Firebase Storage
  const filePath = `images/${userId}/${projectId}/${imageId}`; 

  // Create a reference to the new image location
  const imageRef = ref(storage, filePath);

  // Start the upload (resumable for larger files)
  try {
    const uploadTask = await uploadBytesResumable(imageRef, imageFile);

    // Monitor the upload progress if needed
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
    });

    // Wait for the upload to complete
    await uploadTask;

    // Get the download URL for the uploaded image
    const downloadURL = await getDownloadURL(imageRef);

    // Return the download URL
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error; // Re-throw the error for handling at a higher level
  }
}
