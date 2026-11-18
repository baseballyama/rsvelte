<script>let xs = $state([1]);
let v = $state(9);
function bump() { v++; }</script>
{#snippet p(w)}{const c = v + w}{/snippet}{@render p(1)}<button onclick={bump}>b</button>
