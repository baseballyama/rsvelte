<script>
  function check(s) {
    return /["']a/.test(s) && /b['"]/.test(s);
  }
  const after = check;
</script>
<p>{after}</p>
