<script lang="ts">
  import {
    getTruffleAccessToken,
    getTruffleEmbed,
  } from "$services/truffleService";

  import { onMount, onDestroy } from "svelte";

  import jumper from "$lib/jumper";

  import { onSnapshot, doc, type Unsubscribe } from "firebase/firestore";
  import { db } from "$services/firebase-config";

  function handleClick() {
    jumper.call("comms.postMessage", "questionInput.open");
  }

  let unsubscribe: Unsubscribe;

  const setButtonVisibility = (visible: Boolean, platform: string) => {
    if (visible) {
      const truffleEmbed = getTruffleEmbed();
      truffleEmbed.setVisibility(true);
      truffleEmbed.setStyles(
        platform === "twitch"
          ? {
              height: "30px",
              width: "30px",
              margin: "0px 0px 0px 5px",
              verticalAlign: "middle",
              display: "inline-block",
              boxSizing: "border-box",
            }
          : {
              height: "24px",
              width: "24px",
              padding: "0px 0px 0px 7.5px",
            }
      );
    } else {
      const truffleEmbed = getTruffleEmbed();
      truffleEmbed.setVisibility(false);
    }
  };

  onMount(async () => {
    let accessToken: string = await getTruffleAccessToken();

    const platform = new URLSearchParams(window.location.search).get(
      "platform"
    );

    console.log({ accessToken });

    const [, payload] = accessToken.split(".");
    const payloadObj = JSON.parse(atob(payload));

    const orgId = payloadObj.orgId;

    const displaySettingsRef = doc(db, "orgs", orgId, "settings", "app");
    unsubscribe = onSnapshot(displaySettingsRef, (data) => {
      const canAskQuestions = data.data()?.canAskQuestions;
      setButtonVisibility(canAskQuestions, platform || "youtube");
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<button
  on:click={handleClick}
  type="submit"
  class="bg-pink-500 text-white w-screen h-screen rounded-full font-medium text-md"
  >?</button
>
