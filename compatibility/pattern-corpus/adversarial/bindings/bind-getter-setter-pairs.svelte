<script>
  let raw = $state("a");

  function get() {
    return raw;
  }

  function set(next) {
    raw = next.toUpperCase();
  }
</script>

<input bind:value={get, set} />
<input bind:value={() => raw, (next) => (raw = next)} />
<b>{raw}</b>
