/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2/options";

setGlobalOptions({
  maxInstances: 2,
  timeoutSeconds: 10,
  cpu: 1,
  memory: "256MiB",
  region: "us-central1",
});

initializeApp();

export { generateFirebaseToken } from "./generateFirebaseToken";
export { newQuestion } from "./newQuestion";
