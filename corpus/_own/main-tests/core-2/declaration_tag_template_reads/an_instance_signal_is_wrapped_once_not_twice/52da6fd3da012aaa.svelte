<script>let xs = $state([1]);
let v = $state(9);
function bump() { v++; }</script>
{#if true}{const c = v}{/if}<button onclick={bump}>b</button>
