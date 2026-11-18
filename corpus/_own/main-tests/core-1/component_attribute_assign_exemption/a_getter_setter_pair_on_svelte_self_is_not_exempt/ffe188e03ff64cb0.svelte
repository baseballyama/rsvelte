<script>import Comp from './Comp.svelte';
let o = $state({}), c = $state({});
let obj = {}, tag = 'div', C = Comp, g = () => {};
function f(x) { return x; }</script>
{#if obj}<svelte:self bind:value={() => o.x, (v) => (o.y = obj)} />{/if}