<script>
  const complement = ~1n;
  const negated = -1n;
  const negation = !0n;
  const kind = typeof 1n;
  const voided = void 1n;
  const concatenated = 2n + "x";
  const interpolated = `v=${1n + 2n}`;

  const plainComplement = ~1;
</script>

<p>{complement} {negated} {negation} {kind}</p>
<p>{voided} {concatenated} {interpolated}</p>
<p>{plainComplement}</p>
