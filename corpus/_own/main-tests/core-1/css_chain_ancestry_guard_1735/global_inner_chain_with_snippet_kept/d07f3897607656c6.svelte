<div class="foo">
  <div class="z"></div>
  {@render one()}
</div>
{#snippet one()}<div class="b"></div>{/snippet}
<style>:global(.foo .z) + .b { color: red; }</style>