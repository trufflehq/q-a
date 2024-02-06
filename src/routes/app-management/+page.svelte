<!-- src/AdminConsole.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import questions, { subscribeToQuestions } from "$stores/questionsStore";
  import type { Timestamp, Unsubscribe } from "firebase/firestore";
  import {
    selectQuestionForDisplay,
    markQuestionAsRead,
    generateFirebaseToken,
    setCanAskQuestions,
  } from "$services/firebaseService";
  import { getTruffleAccessToken } from "$services/truffleService";
  import { db } from "$services/firebase-config";
  import { doc, onSnapshot } from "firebase/firestore";

  let unsubscribeQuestions: Unsubscribe;
  let unsubscribeCanAskQuestions: Unsubscribe;

  let orgId: string;
  let urlWithOrgId: string;

  let isLoading = true;
  let isLoadingCanAskQuestions = true;

  onMount(async () => {
    let accessToken: string = await getTruffleAccessToken();

    console.log({ accessToken });

    const [, payload] = accessToken.split(".");
    const payloadObj = JSON.parse(atob(payload));

    orgId = payloadObj.orgId;

    urlWithOrgId = `${window.location.protocol}//${window.location.host}/?orgId=${orgId}`;

    let firebaseToken: string = await generateFirebaseToken(accessToken);

    unsubscribeQuestions = await subscribeToQuestions(orgId, firebaseToken);

    isLoading = false;

    const displaySettingsRef = doc(db, "orgs", orgId, "settings", "app");

    unsubscribeCanAskQuestions = onSnapshot(displaySettingsRef, (data) => {
      const _canAskQuestions = data.data()?.canAskQuestions;
      canAskQuestions = _canAskQuestions;
      isLoadingCanAskQuestions = false;
    });
  });

  onDestroy(() => {
    if (unsubscribeQuestions) unsubscribeQuestions();
    if (unsubscribeCanAskQuestions) unsubscribeCanAskQuestions();
  });

  const clearDisplay = () => {
    selectQuestionForDisplay(orgId, null)
      .then(() => {
        console.log("Display cleared");
      })
      .catch((error) => {
        console.error("Error clearing display: ", error);
      });
  };

  // Helper function to format Firestore Timestamp to a more readable string
  function formatDate(timestamp: Timestamp) {
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  let canAskQuestions = false; // Variable to toggle the ability for viewers to ask questions

  // Function to toggle the question-asking ability
  const handleToggleChange = () => {
    canAskQuestions = !canAskQuestions;

    setCanAskQuestions(orgId, canAskQuestions)
      .then(() => {
        console.log("Can ask questions set to: ", canAskQuestions);
      })
      .catch((error) => {
        console.error("Error setting can ask questions: ", error);
      });
  };
</script>

<body>
  <div class="p-4 text-center w-screen">
    <h2 class="text-xl font-bold mb-4 text-white">Browser Source URL</h2>

    <input
      type="text"
      class="bg-transparent text-white py-1 px-2 rounded-lg mb-4 border-pink-500 border-2"
      style="width: 50%; margin: 0 auto;"
      readonly
      value={urlWithOrgId}
    />

    <div class="flex justify-center p-8">
      <button
        class="bg-pink-500 text-white py-1 px-2 rounded mb-4"
        on:click={clearDisplay}>Clear Display</button
      >
    </div>

    <div class="flex justify-center items-center pb-10">
      {#if isLoadingCanAskQuestions}
        Loading...
      {:else}
        <label for="question-toggle" class="flex items-center cursor-pointer">
          <!-- label -->
          <div class="mr-3 text-white font-medium text-2xl">
            {canAskQuestions ? "Questions Open" : "Questions Closed"}
          </div>
          <!-- toggle -->
          <div class="relative">
            <!-- input -->
            <input
              type="checkbox"
              id="question-toggle"
              class="sr-only"
              checked={canAskQuestions}
              on:change={handleToggleChange}
            />
            <!-- line -->
            <div class="line block bg-red-500 w-14 h-8 rounded-full"></div>
            <!-- dot -->
            <div
              class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"
            ></div>
          </div>
        </label>
      {/if}
    </div>

    <h2 class="text-xl font-bold mb-4 text-white">Questions</h2>

    <div class="space-y-2">
      {#if isLoading}
        <p class="text-white">Loading...</p>
      {:else if $questions.length === 0}
        <p class="text-white">No questions yet</p>
      {:else}
        {#each $questions as question}
          <div class="border border-pink-500 p-4 rounded-lg">
            <p class="p-4 text-xl font-bold">
              <span style="color:{question.user?.nameColor || '#EC4899'}"
                >{question.user?.displayName || "Anonymous"}</span
              >: {question.question}
            </p>
            <button
              class="bg-pink-500 text-white py-1 px-2 rounded m-1"
              on:click={() => selectQuestionForDisplay(orgId, question)}
              >Display</button
            >
            <button
              class="bg-pink-500 text-white py-1 px-2 rounded m-1"
              on:click={() => markQuestionAsRead(orgId, question.id)}
              >Ignore</button
            >
            <p class="text-sm text-gray-500 py-2 m-2">
              Asked on {formatDate(question.timestamp)}
            </p>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</body>

<style>
  body {
    background-color: #101010;
    color: #fff;
    overflow-x: hidden;
  }

  input:checked ~ .dot {
    transform: translateX(100%);
  }

  input:checked ~ .line {
    background-color: #10b981;
  }
</style>
