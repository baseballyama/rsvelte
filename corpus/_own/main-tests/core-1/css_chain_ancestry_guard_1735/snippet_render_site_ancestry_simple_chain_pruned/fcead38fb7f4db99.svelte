<div class="foo"><span>irrelevant</span></div>
{#snippet one()}
  <div class="a"></div>
{/snippet}
<section>
  {@render one()}
</section>
<style>.foo > .a { color: red; }</style>