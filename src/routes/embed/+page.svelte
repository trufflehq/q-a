<script lang="ts">
  import {
    addQuestionToFirestore,
    generateFirebaseToken,
  } from "$services/firebaseService";
  import {
    getTruffleAccessToken,
    getTruffleEmbed,
  } from "$services/truffleService";

  import { onMount } from "svelte";

  import IconClose from "virtual:icons/mdi/close";

  import jumper from "$lib/jumper";

  import { subscribeToAuth } from "@trufflehq/sdk";

  let accessToken: string = "";
  let firebaseToken: string = "";
  let orgId: string = "";

  let isAuthenticated: boolean = false;
  let isLoggedIn: boolean = false;

  let creatorName: string = "the creator";

  let errorMessage: string = "";

  let isLoading = true;
  let isAsking = false;
  let isFollowing = false;

  let platform: string;

  const setQuestionInputVisibility = async (visible: Boolean) => {
    if (visible) {
      if (accessToken === "") {
        let _accessToken: string = await getTruffleAccessToken();

        accessToken = _accessToken;

        console.log({ accessToken });
      }

      if (firebaseToken === "") {
        let _firebaseToken: string = await generateFirebaseToken(accessToken);

        firebaseToken = _firebaseToken;

        console.log({ firebaseToken });
      }

      subscribeToAuth(
        async (truffleApp) => {
          const mtClient = truffleApp.mtClient;

          isLoggedIn = !mtClient.isAnon;

          orgId = mtClient.orgId || "";

          const org = await mtClient.getOrg({ id: mtClient.orgId });

          console.log({ userId: mtClient.userId });

          const orgMember = await getOrgMember(
            mtClient.orgId || "",
            mtClient.userId
          );

          console.log({ orgMember });

          isAuthenticated = mtClient.isAuthenticated && orgMember !== null;

          if (org.name) {
            creatorName = org.name;
          }

          console.log({ isAuthenticated, isLoggedIn });

          isLoading = false;
        },
        { url: "https://mothertree.truffle.vip/graphql" }
      );

      const truffleEmbed = getTruffleEmbed();
      truffleEmbed.setVisibility(true);
      truffleEmbed.setStyles(
        platform == "twitch"
          ? {
              position: "absolute",
              bottom: "0",
              width: "100%",
              height: "100%",
              zIndex: "9999",
            }
          : {
              position: "absolute",
              bottom: "0",
              width: "100%",
              height: "100%",
            }
      );
    } else {
      const truffleEmbed = getTruffleEmbed();
      truffleEmbed.setVisibility(false);
    }
  };

  onMount(async () => {
    platform =
      new URLSearchParams(window.location.search).get("platform") || "youtube";

    jumper.call("comms.onMessage", (message: any) => {
      if (message === "questionInput.open") {
        setQuestionInputVisibility(true);
      }
    });
  });

  const followCreator = async () => {
    if (!accessToken) {
      console.log("No access token");
      return;
    }

    isFollowing = true;

    const ORG_MEMBER_CREATE_MUTATION = `mutation ($input: OrgMemberCreateInput!) {
        orgMemberCreate(input: $input) {
          orgMember {
            id
          }
        }
      }`;

    const mtResponse = await fetch("https://mothertree.truffle.vip/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": accessToken,
        "x-org-id": orgId,
      },
      body: JSON.stringify({
        query: ORG_MEMBER_CREATE_MUTATION,
        variables: { input: { orgId: orgId } },
      }),
    });
    const mtJson = await mtResponse.json();
    console.log("Mt response: ", mtJson);

    isAuthenticated = true;
    isFollowing = false;
  };

  const getOrgMember = async (orgId: string, userId: string) => {
    if (!accessToken) {
      console.log("No access token");
      return;
    }

    const ORG_MEMBER_QUERY = `query($input: OrgMemberInput) {
      orgMember(input:$input) {
        id
        name
      }
    }`;

    const mtResponse = await fetch("https://mothertree.truffle.vip/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      },
      body: JSON.stringify({
        query: ORG_MEMBER_QUERY,
        variables: {
          input: {
            orgIdAndUserId: {
              orgId: orgId,
              userId: userId,
            },
          },
        },
      }),
    });
    const mtJson = await mtResponse.json();
    return mtJson.data.orgMember;
  };

  const submitQuestion = async (event: SubmitEvent) => {
    isAsking = true;
    if (!accessToken) {
      console.log("No access token");
      return;
    }

    if (!firebaseToken) {
      console.log("No firebase token");
      return;
    }

    event.preventDefault(); // to prevent the form from submitting the traditional way
    const form = event.target as HTMLFormElement;
    const questionInput = form.elements.namedItem(
      "question"
    ) as HTMLInputElement;
    const questionText = questionInput.value;

    if (questionText.length === 0) return;

    console.log({ type: "QUESTION", question: questionText });

    const [, payload] = accessToken.split(".");
    const payloadObj = JSON.parse(atob(payload));
    // Send the question text to Firebase Firestore
    const data = await addQuestionToFirestore(
      payloadObj.orgId,
      questionText,
      firebaseToken
    );

    const { error } = data;

    const clearErrorMessage = () => {
      errorMessage = "";
    };

    if (error !== undefined) {
      console.error(error);
      errorMessage = error;

      setTimeout(clearErrorMessage, 3000);
      isAsking = false;
    } else {
      questionInput.value = "";
      setQuestionInputVisibility(false);
    }
    isAsking = false;
  };

  function handleClick() {
    setQuestionInputVisibility(false);
  }
</script>

<div class="p-4 w-screen absolute bottom-0 bg-neutral-800 rounded-t-xl">
  <div class="flex justify-between items-center mb-4 ml-2">
    <h1 class="font-bold text-white">Ask a Question</h1>
    <button
      on:click={handleClick}
      type="button"
      class="bg-transparent text-2xl font-bold ml-2"
    >
      <IconClose style="color: white;" />
    </button>
  </div>

  {#if isLoading}
    <p class="text-white pl-2 pt-2">Loading...</p>
  {:else}
    {#if !isLoggedIn}
      <div class="flex items-center gap-2 mb-2">
        <p class="text-white pl-2 pt-2">
          You must be logged in to Truffle to ask a question.
        </p>
        <a
          href="https://app.truffle.vip/login"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-pink-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          Login
        </a>
      </div>
    {:else if !isAuthenticated}
      <div class="flex items-center gap-2 mb-2">
        <p class="text-white pl-2 pt-2">
          Follow {creatorName} to ask a question
        </p>
        <button
          on:click={followCreator}
          class="bg-pink-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          {#if isFollowing}
            Following...
          {:else}
            Follow
          {/if}
        </button>
      </div>
    {:else}
      <form
        autocomplete="off"
        on:submit={submitQuestion}
        class="flex items-center gap-2 mb-2"
      >
        <input
          type="text"
          class="flex-1 rounded-lg border-pink-500 border-2 px-4 py-2 focus:outline-none w-72"
          placeholder="Ask your question..."
          name="question"
        />
        <button
          type="submit"
          class="bg-pink-500 text-white px-4 py-2 rounded-lg ml-2"
        >
          {#if isAsking}
            Asking...
          {:else}
            Ask
          {/if}</button
        >
      </form>
    {/if}

    {#if errorMessage}
      <p class="text-red-500 pl-2 pt-2">
        {errorMessage}
      </p>
    {/if}
  {/if}
</div>
