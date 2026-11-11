<script>let tag = 'div';</script>
<div class="foo"><svelte:element this={tag}><div class="a"></div><div class="a"></div></svelte:element></div>
<style>.foo > .a { & + & { color: red; } }</style>