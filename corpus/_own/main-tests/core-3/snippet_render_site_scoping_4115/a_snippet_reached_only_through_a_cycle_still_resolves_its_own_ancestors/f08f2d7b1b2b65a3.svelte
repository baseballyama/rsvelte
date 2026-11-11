<script>import Comp from './Comp.svelte';</script>
{#snippet entry(route)}
<li>
<Comp>
{#snippet body()}
<ul>{@render entry(route)}</ul>
{/snippet}
</Comp>
</li>
{/snippet}
<nav class="drawer-nav"><ul>{@render entry(1)}</ul></nav>
<style>nav.drawer-nav { ul { color: red; ul { color: blue; } } }</style>
