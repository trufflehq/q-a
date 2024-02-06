import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

const firestore = getFirestore();
const auth = getAuth();

export const newQuestion = onRequest(
  { cors: true },
  async (request, response) => {
    const { orgId, questionText, idToken } = request.body.data;

    const CHARACTER_LIMIT = 300;
    const COOLDOWN_TIME = 5; // minutes

    let canAskQuestions = false;

    try {
      if (questionText.length > CHARACTER_LIMIT) {
        response.status(200).send({
          data: {
            success: false,
            error: `Question is over ${CHARACTER_LIMIT} characters`,
          },
        });
        return;
      }

      console.log("orgId", orgId);
      console.log("questionText", questionText);
      console.log("idToken", idToken);

      let credentials = await auth.verifyIdToken(idToken);
      const userId = credentials.uid;

      //Check if canAskQuestions is true within the settings collection, app document

      const settingsRef = firestore
        .collection("orgs")
        .doc(orgId)
        .collection("settings")
        .doc("app");
      const settingsData = await settingsRef.get();
      const settings = settingsData.data();

      if (settings !== undefined) {
        console.log("settings", settings.canAskQuestions);
        canAskQuestions = settings.canAskQuestions;
      }

      if (!canAskQuestions) {
        response.status(200).send({
          data: {
            success: false,
            error: "Questions are currently closed",
          },
        });
        return;
      }

      console.log("userId", userId);

      const userRef = firestore.collection("users").doc(userId);
      const userData = await userRef.get();
      const user = userData.data();
      console.log("user", user);

      if (!user) {
        console.log("User not found");
        response.status(200).send({
          data: {
            success: false,
            error: "User not found",
          },
        });
        return;
      }

      // Check if the user has asked a question in the last x minutes

      const lastQuestionTime = user.lastQuestionTime;

      if (lastQuestionTime) {
        const lastQuestionTimeDate = lastQuestionTime.toDate();
        const xMinutesAgo = new Date();
        xMinutesAgo.setMinutes(xMinutesAgo.getMinutes() - COOLDOWN_TIME);

        if (lastQuestionTimeDate > xMinutesAgo) {
          const timeDiff =
            lastQuestionTimeDate.getTime() - xMinutesAgo.getTime();

          const stringMinAndSecDiff = `${Math.floor(timeDiff / 1000 / 60)}m ${
            Math.floor(timeDiff / 1000) % 60
          }s`;

          console.log(
            `Please wait ${stringMinAndSecDiff} before asking another question`
          );
          response.status(200).send({
            data: {
              success: false,
              error: `Please wait ${stringMinAndSecDiff} before asking another question`,
            },
          });
          return;
        }
      } else {
        console.log("User has not asked a question before");
      }

      // Add the question to Firestore
      const docRef = await firestore.collection(`orgs/${orgId}/questions`).add({
        orgId: orgId,
        question: questionText,
        hasRead: false,
        user: {
          displayName: user.displayName,
          nameColor: user.nameColor,
          userRef: userRef,
        },
        timestamp: Timestamp.now(),
      });
      console.log("Document written with ID: ", docRef.id);

      // Update the user's lastQuestionTime
      await userRef.update({
        lastQuestionTime: Timestamp.now(),
      });

      response.status(200).send({ data: { success: true, docId: docRef.id } });
    } catch (e) {
      console.error("Error adding document or updating user: ", e);
      response.status(200).send({ data: { success: false, error: e } });
    }
  }
);
