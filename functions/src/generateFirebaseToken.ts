import { onRequest } from "firebase-functions/v2/https";
import * as jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getColor, getName, getOrgMember } from "./shared/org-member";

const firestore = getFirestore();
const auth = getAuth();

export const MOTHERTREE_PUBLIC_ES256_KEY =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGzVELuVubW1DcXJPZ7cHssy4SXc0\n" +
  "d6inNpg1L8Lwo/YqSnNQwW+nJTQOm9q+ZAfJUjOgHpfMpyNYVOzaWunz2Q==\n" +
  "-----END PUBLIC KEY-----";

const orgUserGqlQuery = `
    query UserOrg($input: OrgUserInput) {
      orgUser(input: $input) {
        id
        name
        orgId
        userId
        keyValue(input: { key: "nameColor" }) {
          id
          value
        }
      }
    }`;

export const generateFirebaseToken = onRequest(
  { cors: true },
  async (request, response) => {
    // setup cors
    response.set("Access-Control-Allow-Origin", "*");

    // get token from request
    const accessToken: string = request.body.data.token;
    if (!accessToken) {
      response.status(200).send({ data: { error: "No token provided" } });
      return;
    }
    if (typeof accessToken !== "string") {
      response
        .status(200)
        .send({ data: { error: "Invalid token type provided" } });
      return;
    }

    console.log("Token: ", accessToken);

    // if the token is invalid, this will throw an error
    try {
      const payload = jwt.verify(accessToken, MOTHERTREE_PUBLIC_ES256_KEY, {
        algorithms: ["ES256"],
      }) as any;
      console.log("Token payload: ", payload);
      console.log("Token orgId: ", payload.orgId);
      const orgId: string = payload.orgId;
      // execture gql query and get roles and name
      const mtResponse = await fetch("https://mothertree.truffle.vip/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": accessToken,
        },
        body: JSON.stringify({
          query: orgUserGqlQuery,
          variables: { input: { orgId: orgId } },
        }),
      });
      const mtJson = await mtResponse.json();
      console.log("Mt response: ", mtJson);

      let isOwner = false;

      if (mtJson.data.orgUser !== null) {
        isOwner = mtJson.data.orgUser.id === payload.orgUserId;
      }

      const additionalClaims = {
        orgId: payload.orgId,
        isOwner: isOwner,
      };

      if (!payload.sub || !payload.orgId) {
        response.status(200).send({ data: { error: "No sub or orgId" } });
        return;
      }
      const firebaseToken = await auth.createCustomToken(
        payload.sub + payload.orgId,
        additionalClaims
      );

      let orgMember = await getOrgMember(
        accessToken,
        payload.orgId,
        payload.userId
      );

      if (orgMember === null || orgMember === undefined) {
        let orgUserName = "the creator";
        if (
          mtJson.data.orgUser !== null &&
          mtJson.data.orgUser !== undefined &&
          mtJson.data.orgUser.name !== null &&
          mtJson.data.orgUser.name !== undefined
        ) {
          orgUserName = mtJson.data.orgUser.name;
        }

        response
          .status(200)
          .send({ data: { error: `Follow ${orgUserName} to ask a question` } });
        return;
      }

      const orgMemberColor = getColor({ orgMember: orgMember });

      const orgMemberName = getName({ orgMember: orgMember });

      console.log("Org member: ", orgMember);

      // create user in firestore if it doesn't exist
      const userRef = firestore
        .collection("users")
        .doc(payload.sub + payload.orgId);
      // set user from firestore
      await userRef.set(
        {
          orgId: payload.orgId,
          displayName: orgMemberName,
          nameColor: orgMemberColor,
        },
        { merge: true }
      );

      response.status(200).send({ data: { firebaseToken: firebaseToken } });
    } catch (e: any) {
      response.status(200).send({
        data: { error: "Unable to verify token, get rekt + " + e.message },
      });
      return;
    }
  }
);
