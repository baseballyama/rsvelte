<script>
  let v = $state(1);

  const noSemi = () => v + 1;

  const arrowNextLine = (x) => x * 2;

  const chained = [1, 2]
    .map((x) => x * 2)
    .filter((x) => x > 1)
    .reduce((a, b) => a + b, 0);

  const ternaryWrapped = v > 0 ? "positive" : "other";

  const commaSeq = (v, v + 1);

  label: {
    break label;
  }

  const escaped = "\\";
  const escapedQuote = "'";
  const backtickBrace = `${"}"}`;
</script>

<b>{noSemi()}</b>
<b>{arrowNextLine(v)}</b>
<b>{chained}</b>
<b>{ternaryWrapped}</b>
<b>{commaSeq}</b>
<b>{escaped.length}</b>
<b>{escapedQuote.length}</b>
<b>{backtickBrace}</b>
