<script>
  /** the built-in console coming with the Viewer isn't shown */
  let n = $state(0);
  const cont = "a\
b";
  function bump() {
    n += 1;
  }
</script>

<button onclick={bump}>{cont}{n}</button>
