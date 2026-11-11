<div class="foo">
  {@render pair()}
</div>
{#snippet pair()}
  <div class="a"></div><div class="a"></div>
{/snippet}
<style>.foo > .a { & + & { color: red; } }</style>