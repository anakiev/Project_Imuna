import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { db } from "@/lib/auth/clientApp";
import {auth} from "@/lib/auth/clientApp";
import { getMyProfile } from "./getMyProfile";
import { createMyProfile } from "./createMyProfile";

export interface NewProject {
  title: string;
  article_text?: string; // Optional initial article text
  multimedia?: any[];     // Optional initial multimedia array
}

export async function createNewProject(newProject: NewProject, projectId: string) {
  try {
    const  currentUser  = auth.currentUser
    let email= "";
    if(currentUser?.email)
      email = currentUser.email
    else {
        console.error("No user found");
        return;
    }
    let userId = currentUser.uid // Change this to the actual user ID //:TODO
    const fetchedProfiles = await getMyProfile(db, {});
    const profile = fetchedProfiles[0];
    if(!profile){
      const profile = await createMyProfile(db, {})
    }
    const userDocRef = doc(db, "users/"+ userId);

    const result = await updateDoc(userDocRef, {
      projects: arrayUnion({
        title: newProject.title,
        article_text: newProject.article_text || "", // Default to empty string
        multimedia: newProject.multimedia || [],    // Default to empty array
        last_modified: new Date(),                 // Set initial timestamp
        stage: "in progress",                     // Set initial stage
        projectId: projectId,
                            
      }),
    });
    console.log("New Article ID IS: ", result);
    console.log("New project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error);
    throw error; // Optionally re-throw the error for handling elsewhere
  }
}