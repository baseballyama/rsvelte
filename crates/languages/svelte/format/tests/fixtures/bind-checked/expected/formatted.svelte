<script>
  let agreed = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={agreed} />
  I agree
</label>
{#if agreed}
  <p>Thanks.</p>
{/if}
