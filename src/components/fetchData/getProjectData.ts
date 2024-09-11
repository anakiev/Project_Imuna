
import { doc, getDoc } from "firebase/firestore";

import { db } from '@/lib/auth/clientApp';
export async function getProjectData(userId: string | null | undefined, projectId: number){
    try {
      // Reference to the user document
      console.log('userId=' + userId);
      if(!userId || userId == "") 
        return null;
      const userRef = doc(db, "users", userId); 

      // Fetch the user document
      const userSnapshot = await getDoc(userRef);
  
      if (userSnapshot.exists()) {
        // Extract the projects array from the user document
        const userData = userSnapshot.data();
        const projects = userData.projects;
  
        if (projectId >= 0 && projectId < projects.length) {
          // Ensure the project ID is valid
          const project = projects[projectId]; // Get the project by index
          return project;
        } else {
          console.error(`Project with ID ${projectId} not found for user ${userId}.`);
          return null; 
        }
      } else {
        console.error(`User with ID ${userId} not found.`);
        return null; 
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error; 
    }
  }
