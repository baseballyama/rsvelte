<div class="themed">a</div>

<style>
  @font-face {
    font-family: "Local";
    src: url("/f.woff2") format("woff2");
    font-display: swap;
  }

  @property --angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }

  @page {
    margin: 1cm;
  }

  :root {
    --base: 4px;
    --scale: 2;
  }

  .themed {
    --local: calc(var(--base) * var(--scale));
    padding: var(--local, 8px);
    margin: var(--missing, var(--base, 2px));
    rotate: var(--angle);
    color: color-mix(in srgb, red 50%, blue);
  }

  @media print {
    .themed {
      color: black;
    }
  }
</style>
