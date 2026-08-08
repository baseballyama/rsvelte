<script>
  const fixed = "a\u0041b";
  const braced = "a\u{1F600}b";
  const pair = "a\uD83D\uDE00b";
  const hex = "a\x41b";
</script>

<p>{fixed}</p>
<p>{braced}</p>
<p>{pair}</p>
<p>{hex}</p>
