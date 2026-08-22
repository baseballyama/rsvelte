<script>
  let hue = $state(200);
</script>

<div class="swatch" style:--hue={hue} style="--fallback: 10deg">
  <span>x</span>
</div>

<style>
  .swatch {
    --local: calc(var(--hue, 0) * 1deg);
    background: hsl(var(--local) 50% 50%);
    filter: hue-rotate(var(--fallback, 0deg));
  }

  .swatch span {
    color: var(--undefined-on-purpose, currentColor);
  }
</style>
