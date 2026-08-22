<script>
  let v = $state(1);
</script>

<svg viewBox="0 0 4 4">
  <clipPath id="c"><rect width="1" height="1" /></clipPath>
  <linearGradient id="g"><stop offset="0%" /></linearGradient>
  <radialGradient id="r"><stop offset="0%" /></radialGradient>
  <textPath href="#p">{v}</textPath>
  <feColorMatrix type="saturate" values="0" />
  <feGaussianBlur stdDeviation="1" />
  <feComponentTransfer><feFuncA type="identity" /></feComponentTransfer>
  <animateTransform attributeName="transform" type="rotate" />
  <foreignObject width="1" height="1"></foreignObject>
</svg>
