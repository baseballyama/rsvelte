<script>let xs = $state([1]);
const pr = Promise.resolve(1);
let v = $state(9);</script>
{#snippet p(v)}{const c = v}{/snippet}{@render p(1)}
