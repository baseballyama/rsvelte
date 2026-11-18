<script>
  let n = $state(1);

  const one = `a${n}b`;
  const nested = `outer ${`inner ${n} ${`deep ${n}`}`} end`;
  const withBrace = `${"}"}${"{"}`;
  const withBacktick = `\``;
  const multiline = `line1
line2`;

  function tag(strings, ...values) {
    return strings.raw.join("|") + values.join(",");
  }

  const tagged = tag`a${n}b`;
  const nestedTagged = tag`x${tag`y${n}`}`;
</script>

<b>{one}</b>
<b>{nested}</b>
<b>{withBrace}{withBacktick}</b>
<b>{multiline.length}</b>
<b>{tagged}{nestedTagged}</b>
