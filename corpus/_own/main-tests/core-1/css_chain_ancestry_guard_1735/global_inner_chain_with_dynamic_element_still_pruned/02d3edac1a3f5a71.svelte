<script>let tag = 'div';</script>
<div class="foo"><svelte:element this={tag}><div class="z"></div><div class="b"></div></svelte:element></div>
<style>:global(.foo > .z) + .b { color: red; }</style>