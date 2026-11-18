<script>
  const sum = 7n + 2n;
  const quotient = -8n / 3n;
  const remainder = -8n % 3n;
  const power = 2n ** 64n;
  const shifted = 8n >> -1n;
  const masked = -1n & 3n;
  const beyondDouble = 9007199254740993n + 1n;

  const plainNumber = 7 + 2;
  const readOnly = 1n;
</script>

<p>{sum} {quotient} {remainder} {power}</p>
<p>{shifted} {masked} {beyondDouble}</p>
<p>{plainNumber} {readOnly}</p>
