<script>
  let label = $state("x");
</script>

<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g"><stop offset="0%" /></linearGradient>
  </defs>
  <rect width="10" height="10" fill="url(#g)" />
  <text x="1" y="1" font-size="2">{label}</text>
  <foreignObject width="10" height="10">
    <div xmlns="http://www.w3.org/1999/xhtml">{label}</div>
  </foreignObject>
</svg>

<math display="block">
  <mrow>
    <mi>{label}</mi>
    <mo>+</mo>
    <mn>1</mn>
  </mrow>
</math>
