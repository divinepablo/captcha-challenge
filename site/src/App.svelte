<script lang="ts">
  import axios from "axios";
  let url = "";
  let verified = false;
  const verifyCaptcha = async () => {
    const response = hcaptcha.getResponse();
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const result = await axios.post("/verify", { response, token });

    console.log(result.data);
    if (result.data.success) {
      verified = true;
      url = result.data.message;
    } else {
      alert(result.data.message);
    }
  };
</script>

<body>
  <div class="flex flex-col h-screen justify-center items-center font-sans">
    <h1 class="text-xl font-semibold mb-4">Verify humanity</h1>
    <form
      on:submit|preventDefault={verifyCaptcha}
      class="bg-gray-900 rounded-lg p-6"
    >
      <div
        class="h-captcha mb-6"
        data-sitekey="029a6366-e8b0-4c1e-ae56-b9b232a2585a"
      />
      <div class="flex flex-col justify-center items-center">
        {#if verified}
          <a
            type="submit"
            class="bg-green-400 w-full text-white text-center flex justify-center content-center py-2 px-4 rounded"
            href={url}>Continue</a
          >
        {:else}
          <button
            type="submit"
            class="bg-gray-700 w-full text-white py-2 px-4 rounded"
          >
            Submit
          </button>
        {/if}
      </div>
    </form>
  </div>
</body>

<style lang="postcss">
  body {
    background-color: #1a202c;
    color: #fff;
  }
</style>
