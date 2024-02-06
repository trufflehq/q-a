<!-- src/OBSOverlay.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { onSnapshot, doc, type Unsubscribe } from "firebase/firestore";
  import { db } from "$services/firebase-config";
  import type { Question } from "../types/question";

  let displayedQuestion: Question | null = null;
  let unsubscribeSettings: Unsubscribe;
  let unsubscribeQuestions: Unsubscribe;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get("orgId") || "";

    const displaySettingsRef = doc(db, "orgs", orgId, "settings", "display");
    unsubscribeSettings = onSnapshot(displaySettingsRef, (data) => {
      displayedQuestion = data.data()?.question;
    });
  });

  onDestroy(() => {
    if (unsubscribeSettings) unsubscribeSettings();
    if (unsubscribeQuestions) unsubscribeQuestions();
  });
</script>

<div class="overlay">
  {#if displayedQuestion}
    <div
      class="fixed bottom-10 left-1/2 transform -translate-x-1/2 rounded-lg shadow-md bg-black/90 p-4 max-w-4xl mb-14"
    >
      <div class="text-white text-6xl font-bold font-sans text-center">
        {#if displayedQuestion && displayedQuestion.user !== undefined && displayedQuestion.user.displayName !== undefined}
          <span style="color:{displayedQuestion.user.nameColor || '#EC4899'}"
            >{displayedQuestion.user.displayName}</span
          ><span class="text-white">:</span>
        {/if}
        {displayedQuestion.question}
      </div>
    </div>
  {/if}
</div>
