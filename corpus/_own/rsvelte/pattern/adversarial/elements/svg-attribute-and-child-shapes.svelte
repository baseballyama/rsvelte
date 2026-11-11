<script>
  let d = $state("M0 0 L10 10");
  let rows = $state([1, 2]);
</script>

<svg
  viewBox="0 0 10 10"
  width="10"
  height="10"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <linearGradient
      id="g"
      gradientUnits="userSpaceOnUse"
      x1="0"
      y1="0"
      x2="1"
      y2="1"
    >
      <stop offset="0%" stop-color="red" stop-opacity="0.5" />
      <stop offset="100%" stop-color="blue" />
    </linearGradient>
    <clipPath id="c" clipPathUnits="objectBoundingBox">
      <rect width="1" height="1" />
    </clipPath>
    <filter id="f">
      <feGaussianBlur stdDeviation="1" />
      <feColorMatrix type="saturate" values="0.5" />
    </filter>
  </defs>
  <g
    transform="translate(1, 1) rotate(45)"
    clip-path="url(#c)"
    filter="url(#f)"
  >
    <path {d} fill="url(#g)" stroke-width="0.5" stroke-linecap="round" />
    {#each rows as row (row)}
      <circle cx={row} cy={row} r="0.5" />
    {/each}
  </g>
  <text
    x="1"
    y="1"
    text-anchor="middle"
    dominant-baseline="central"
    font-size="2"
  >
    a
    <tspan dx="1" dy="1">b</tspan>
  </text>
</svg>
