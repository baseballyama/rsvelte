<script>let xs = $state([1]);
const pr = Promise.resolve(1);
let v = $state(9);</script>
{#each xs as v}{@const c = v}{/each}
