<script>let xs = $state([1]);
const pr = Promise.resolve(1);
let v = $state(9);</script>
{#await pr then v}{const c = v}{/await}
