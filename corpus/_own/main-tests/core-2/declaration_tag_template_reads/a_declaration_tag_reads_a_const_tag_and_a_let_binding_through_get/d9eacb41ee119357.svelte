<script>let xs = $state([1]);
const pr = Promise.resolve(1);
let v = $state(9);</script>
{#each xs as q}{@const v = q + 1}{const c = v}{/each}
