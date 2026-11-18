<div class="foo"><span>irrelevant</span></div>
{#snippet pair()}
  <div class="a"></div><div class="a"></div>
{/snippet}
<section>
  {@render pair()}
</section>
<style>.foo > .a { & + & { color: red; } }</style>