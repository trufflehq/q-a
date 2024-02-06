import { db, auth } from "./firebase-config";
import {
  doc,
  collection,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  or,
  setDoc,
} from "firebase/firestore";

import { getAuth, signInWithCustomToken } from "firebase/auth";

import { httpsCallable } from "firebase/functions";

import { functions } from "./firebase-config";
import type { Question } from "$types/question";

// export const addQuestionToFirestore = async (
//   orgId: string,
//   questionText: string,
//   firebaseAuthToken: string
// ) => {
//   try {
//     let credientals = await signInWithCustomToken(auth, firebaseAuthToken);

//     console.log(credientals);

//     const user = doc(collection(db, "users"), credientals.user.uid);
//     console.log("user", getDoc(user));

//     const docRef = await addDoc(collection(db, "orgs", orgId, "questions"), {
//       orgId: orgId,
//       question: questionText,
//       hasRead: false,
//       user: user,
//       timestamp: serverTimestamp(),
//     });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// };

export const addQuestionToFirestore = async (
  orgId: string,
  questionText: string,
  firebaseAuthToken: string
) => {
  let credientals = await signInWithCustomToken(auth, firebaseAuthToken);

  const idToken = await credientals.user.getIdToken();

  const newQuestion = httpsCallable(functions, "newQuestion");
  const result: any = await newQuestion({
    orgId,
    questionText,
    idToken,
  });
  return result.data;
};

export const selectQuestionForDisplay = async (
  orgId: string,
  question: Question | null
) => {
  const displaySettingsRef = doc(db, "orgs", orgId, "settings", "display");

  if (question) {
    await markQuestionAsRead(orgId, question.id);
    await setDoc(displaySettingsRef, { question }, { merge: true });
  } else {
    await setDoc(displaySettingsRef, { question: null }, { merge: true });
  }
};

export const setCanAskQuestions = async (
  orgId: string,
  canAskQuestions: boolean
) => {
  const displaySettingsRef = doc(db, "orgs", orgId, "settings", "app");
  await setDoc(displaySettingsRef, { canAskQuestions }, { merge: true });
};

export const markQuestionAsRead = async (orgId: string, questionId: string) => {
  const questionRef = doc(db, "orgs", orgId, "questions", questionId);
  await updateDoc(questionRef, { hasRead: true });
};

export const generateFirebaseToken = async (
  accessToken: string
): Promise<string> => {
  const generateFirebaseToken = httpsCallable(
    functions,
    "generateFirebaseToken"
  );
  const result: any = await generateFirebaseToken({ token: accessToken });
  return result.data.firebaseToken;
};
