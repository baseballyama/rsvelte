<script>import Comp from './Comp.svelte';
let o = $state({}), c = $state({});
let obj = {}, tag = 'div', C = Comp, g = () => {};
function f(x) { return x; }</script>
<div><Comp bind:value={() => o.x, (v) => (o.y = obj)} /></div>