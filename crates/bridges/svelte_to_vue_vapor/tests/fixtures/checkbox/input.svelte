<script>
  let agreed = $state(false);
</script>

<label><input type="checkbox" class="agree" bind:checked={agreed} /> I agree</label>
<p class="status">{agreed ? 'agreed' : 'not yet'}</p>
<button class="submit" disabled={!agreed}>continue</button>
