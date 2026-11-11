<script>import Comp from './Comp.svelte';
let o = $state({}), c = $state({});
let obj = {}, tag = 'div', C = Comp, g = () => {};
function f(x) { return x; }</script>
<svelte:element this={tag} bind:clientWidth={() => o.y, (v) => (o.y = obj)}></svelte:element>