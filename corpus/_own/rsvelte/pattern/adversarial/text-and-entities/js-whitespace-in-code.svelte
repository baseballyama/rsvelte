<script>
  // U+00A0, U+3000 and U+2028 are JS whitespace but not ASCII space.
  const nbsp = "\u00a0";
  const ideographic = "\u3000";
  const lineSeparator = "\u2028";
  const zeroWidth = "\ufeff";
  const combined = nbsp + ideographic + lineSeparator + zeroWidth;
</script>

<b>{combined.length}{nbsp.charCodeAt(0)}{zeroWidth.charCodeAt(0)}</b>
