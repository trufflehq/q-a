// src/types/Question.ts

import type { Timestamp } from "firebase/firestore";

// src/types.ts
export interface Question {
  id: string;
  // Add other question properties here, matching the fields in your Firestore documents
  orgId: string;
  question: string;
  hasRead: boolean;
  timestamp: Timestamp; // Replace with the correct type
  user?: {
    displayName?: string;
    nameColor?: string;
    userRef?: string;
  };
}
