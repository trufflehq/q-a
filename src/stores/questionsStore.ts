// src/stores/questionsStore.ts
import { writable } from "svelte/store";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { auth, db } from "$services/firebase-config";
import type { Question } from "$types/question";
import { signInWithCustomToken } from "firebase/auth";

const questions = writable<Question[]>([]);

export const subscribeToQuestions = async (
  orgId: string,
  firebaseToken: string
) => {
  let credientals = await signInWithCustomToken(auth, firebaseToken);

  console.log(credientals);

  const questionsQuery = query(
    collection(db, "orgs", orgId, "questions"),
    where("hasRead", "==", false),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(questionsQuery, (querySnapshot) => {
    const fetchedQuestions: Question[] = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Question)
    );
    questions.set(fetchedQuestions);
  });
};

export default questions;
