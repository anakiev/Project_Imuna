import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged as _onAuthStateChanged,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword as _signInWithEmailAndPassword
  } from "firebase/auth";
  
  import { auth } from "@/lib/auth/clientApp";
  
  export function onAuthStateChanged(cb: any) {
      return _onAuthStateChanged(auth, cb);
  }
  
  export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
  
    try {
      const wait = await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  }
  export async function signOut() {
    try {
      return await auth.signOut();
    } catch (error) {
      console.error("Error signing out with Google", error);
    }
  }
  export async function signUpWithEmail(email: string, password: string, setloginError: any) {

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      setloginError(errorCode);
    });
  }
  
  export async function signInWithEmailAndPassword(email: string, password: string, setloginError: any) {

    _signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      setloginError(errorCode);
    });
  }